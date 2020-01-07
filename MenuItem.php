<?php

namespace dokuwiki\plugin\drawio;

use dokuwiki\Menu\Item\AbstractItem;

class MenuItem extends AbstractItem {

    /** @inheritDoc */
    protected $type = 'add_diagram';

    /** @inheritDoc */
    protected $svg = __DIR__ . '/drawing.svg';

    /**
     * @inheritDoc
     * @todo localize
     */
    public function getLabel()
    {
        return 'Neues Diagramm';
    }

    /** @inheritDoc */
    public function getLinkAttributes($classprefix = 'menuitem ')
    {
        $attr = parent::getLinkAttributes($classprefix);
        $attr['href'] = '#';
        $attr['id'] = 'drawio-newfile-create';
        return $attr;
    }
}
