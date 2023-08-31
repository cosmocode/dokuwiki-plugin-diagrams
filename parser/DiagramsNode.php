<?php

namespace dokuwiki\plugin\diagrams\parser;

use dokuwiki\plugin\prosemirror\parser\Node;

/**
 * Represents an embedded diagram
 *
 * Note: for mediafile diagrams the image node is reused
 */
class DiagramsNode extends Node
{
    /**
     * @var Node
     */
    protected $parent;

    /**
     * @var mixed
     */
    protected $data;

    /** @inheritdoc */
    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }

    /** @inheritdoc */
    public function toSyntax()
    {
        $openingTag = '<diagram';
        if (!empty($this->data['attrs']['align'])) {
            $openingTag .= ' ' . $this->data['attrs']['align'];
        }
        if (!empty($this->data['attrs']['width']) && !empty($this->data['attrs']['height'])) {
            $openingTag .= ' ' . $this->data['attrs']['width'] . 'x' . $this->data['attrs']['height'];
        }
        if (!empty($this->data['attrs']['title'])) {
            $openingTag .= ' |' . $this->data['attrs']['title'];
        }
        $openingTag .= '>';

        $svg = $this->data['attrs']['url'];
        if (substr($svg, 0, 26) !== 'data:image/svg+xml;base64,') {
            throw new \Exception('bad data uri "' . substr($svg, 0, 26) . '"');
        }
        $svg = base64_decode(substr($svg, 26));
        return $openingTag . $svg . "</diagram>";
    }
}
