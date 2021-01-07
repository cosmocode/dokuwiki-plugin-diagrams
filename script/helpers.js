const serviceUrl = 'https://embed.diagrams.net/?embed=1&proto=json&spin=1';
const doctypeXML = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

/**
 * check if name/id of new diagram is valid
 *
 * @param id
 * @returns {boolean}
 */
function validId(id) {
    return id.length > 0 && /^[\w][\w\.\-]*$/.test(id)
}

/**
 * return URL of an existing diagram
 *
 * @param ns
 * @param id
 * @returns {string}
 */
function getLocalDiagramUrl(ns, id) {
    return DOKU_BASE + 'lib/exe/ajax.php?call=mediaupload&ow=true&ns=' + ns + '&qqfile=' + id + '&sectok=' + JSINFO['sectok'];
}

/**
 * split full id into ns and id parts
 *
 * @param fullId
 * @returns {{ns: string, id: *}}
 */
function splitFullId(fullId) {
    let id = fullId;
    let ns = '';
    const idParts = id.split(':');
    if (idParts.length > 1) {
        id = idParts.pop(idParts);
        ns = idParts.join(':');
    }
    return {ns: ns, id: id};
}

/**
 * extract image id from media URL
 *
 * @param {string} url
 * @returns {string}
 */
function extractIdFromMediaUrl(url) {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    if (path.indexOf(DOKU_BASE) === 0) {
        path = path.substr(DOKU_BASE.length);
    }

    if (urlObj.searchParams.get('media') !== null) {
        // no rewriting
        return normalizeId(urlObj.searchParams.get('media'));
    } else if (
        path.indexOf('lib/exe/detail.php/') === 0 ||
        path.indexOf('lib/exe/fetch.php/') === 0
    ) {
        // internally rewritten URL, cut off three segments
        return normalizeId(path.split('/').slice(3).join(':'));
    } else if (
        path.indexOf('_media/') === 0 ||
        path.indexOf('_detail/') === 0
    ) {
        // .htaccess rewritten URL, cut off one segment
        return normalizeId(path.split('/').slice(1).join(':'));
    }
}

/**
 * Handles IDs with useslash enabled
 *
 * @param {string} id
 * @return {string}
 */
function normalizeId(id) {
    return ':' + id.replace(/\//g, ":");
}
