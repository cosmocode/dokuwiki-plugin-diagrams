<?php

use dokuwiki\plugin\diagrams\parser\DiagramsNode;
use dokuwiki\plugin\prosemirror\parser\ImageNode;
use dokuwiki\plugin\prosemirror\schema\Node;

/**
 * DokuWiki Plugin diagrams (Action Component)
 *
 * @license GPL 2 http://www.gnu.org/licenses/gpl-2.0.html
 * @author  Anna Dabrowska <dabrowska@cosmocode.de>
 */
class action_plugin_diagrams_prosemirror extends \dokuwiki\Extension\ActionPlugin
{

    /** @inheritDoc */
    public function register(Doku_Event_Handler $controller)
    {
        $controller->register_hook('PROSEMIRROR_RENDER_PLUGIN', 'BEFORE', $this, 'handleRender');
        $controller->register_hook('PROSEMIRROR_PARSE_UNKNOWN', 'BEFORE', $this, 'handleNode');
    }

    /**
     * Event handler for PROSEMIRROR_RENDER_PLUGIN
     * Renders DokuWiki's instructions into JSON as required by schema
     *
     * @param Doku_Event $event Event object
     * @return void
     */
    public function handleRender(Doku_Event $event) {
        /*
          $eventData = [
            'name' => $name,
            'data' => $data,
            'state' => $state,
            'match' => $match,
            'renderer' => $this,
        ];*/

        $eventData = $event->data;
        $imageData = $eventData['data'];

        //check for our data
        if (
            $eventData['name'] !== 'diagrams_mediafile' &&
            $eventData['name'] !== 'diagrams_embed'
        ) return;

        $event->preventDefault();

        if($eventData['name'] === 'diagrams_mediafile') {
            $url = $imageData['url'];
        } else {
            // we use a data uri that will be loaded in an img tag
            // this should provide the same amount of security as our CSP but can be interactively
            // changed during the edit session
            $url = 'data:image/svg+xml;base64,' . base64_encode($imageData['svg']);
        }

        $node = new Node('diagrams');
        $node->attr('type', $eventData['name'] === 'diagrams_mediafile' ? 'mediafile' : 'embed');
        $node->attr('id', $imageData['src'] ?? ''); // only for mediafile
        $node->attr('data', $url); // FIXME rename to url here, in schema and everywhere
        $node->attr('title', $imageData['title'] ?? '');
        $node->attr('width', $imageData['width']);
        $node->attr('height', $imageData['height']);
        $node->attr('align', $imageData['align']);

        $event->data['renderer']->addToNodestack($node);
    }

    /**
     * Event handler for PROSEMIRROR_PARSE_UNKNOWN
     * Translate the JSON from Prosemirror back to DokuWiki's syntax
     *
     * @param Doku_Event $event
     * @return void
     */
    public function handleNode(Doku_Event $event)
    {
        /*
          $eventData = [
            'node' => $node,
            'parent' => $parent,
            'previous' => $previous,
            'newNode' => null,
        ];*/

        // check for our node type
        if ($event->data['node']['type'] !== 'diagrams') return;

        $event->preventDefault();

        // FIXME for embedded mode we need a more custom node

        if($event->data['node']['attrs']['type'] === 'mediafile') {
            $node = new ImageNode($event->data['node'], $event->data['parent']);
        } else {
            $node = new DiagramsNode($event->data['node'], $event->data['parent']);
        }


        $event->data['newNode'] = $node;
    }
}
