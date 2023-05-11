<?php

namespace dokuwiki\plugin\diagrams\parser;

use dokuwiki\plugin\prosemirror\parser\Node;

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

    public function __construct($data, Node $parent)
    {
        $this->parent = &$parent;
        $this->data = $data;
    }


    public function toSyntax()
    {
        $openingTag = '<diagram';
        if (!empty($this->data['attrs']['align'])) {
            $openingTag .= ' ' . $this->data['attrs']['align'];
        }
        $openingTag .= '>';

        $svg = $this->data['attrs']['url'];
        if (substr($svg, 0, 26) !== 'data:image/svg+xml;base64,') {
            throw new \Exception('bad data uri "'.substr($svg, 0, 26).'"');
        }
        $svg = base64_decode(substr($svg, 26));
        return $openingTag . $svg . "</diagram>";
    }


}
