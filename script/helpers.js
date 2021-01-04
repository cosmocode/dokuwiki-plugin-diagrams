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
        ns = idParts[0];
        id = idParts.slice(1).join(':');
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
 * extract image id from fetch media URL
 * @param {string} url
 * @returns {string}
 */
function extractIdFromMediaUrl(url) {
    return url.split('media=')[1].split('&')[0];
}
