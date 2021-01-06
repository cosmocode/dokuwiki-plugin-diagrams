const serviceUrl = 'https://embed.diagrams.net/?embed=1&proto=json&spin=1';
const doctypeXML = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

/**
 * check if name/id of new diagram is valid
 *
 * @param id
 * @returns {boolean}
 */
function validId(id) {
    return id.length > 0 && /^[\w][\w\.\-]*$/.test( id )
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
 * extract ns param from URL
 *
 * @param url
 * @returns {string}
 */
function extractNs(url) {
    const urlParam = function(name) {
        const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(url);
        return results[1] || '';
    };
    return decodeURIComponent(urlParam('ns'));
}

/**
 * extract image id from media URL
 *
 * @param {string} url
 * @returns {string}
 */
function extractIdFromMediaUrl(url) {
    // handle empty base url
    if (url.indexOf('http') !== 0 && DOKU_BASE === '/') {
        url = window.location.origin + url;
    }

    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const href = urlObj.href;

    if (path.indexOf('/lib/exe/detail.php/') === 0 || path.indexOf('/lib/exe/fetch.php/') === 0) {
        // media with internal rewriting
        const mediaIdMatch = new RegExp(
            '(?:\\/lib\\/exe\\/detail.php\\/|\\/lib\\/exe\\/fetch.php\\/)([^&]+)$'
        );
        const matches = mediaIdMatch.exec(path);
        if (matches[1]) {
            return normalizeId(matches[1]);
        }
    } else if (path.indexOf('/lib/exe/detail.php') === 0 || path.indexOf('/lib/exe/fetch.php') === 0) {
        // media without rewriting
        const mediaIdMatch = new RegExp('(?:media=)([^&]+)');
        const matches = mediaIdMatch.exec(href);
        if (matches[1]) {
            return normalizeId(matches[1]);
        }
    } else if (path.indexOf('/_media/') === 0) { // media with .htaccess rewriting
        const mediaIdMatch = /(?:_media\/)([^&\?]+)/;
        const matches = href.match(mediaIdMatch);
        if (matches[1]) {
            return normalizeId(matches[1]);
        }
    } else if (path.indexOf('/_detail/') === 0) { // media with .htaccess rewriting
        const mediaIdMatch = /(?:_detail\/)([^&\?]+)/;
        const matches = href.match(mediaIdMatch);
        if (matches[1]) {
            return normalizeId(matches[1]);
        }
    }
}

function normalizeId(id) {
    return ':' + id.replace(/\//g, ":");
}
