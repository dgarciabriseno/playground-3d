import * as THREE from "three";

/**
 * Returns a date string usable with the Helioviewer API
 * @param {Date} date Javascript date object
 * @returns {string} Date that can be used in an API request
 */
function ToAPIDate(date) {
    return date.toISOString();
}

function parseDate(datestr) {
    let numbers = datestr.split(/[^0-9]/);
    numbers = numbers.map((numstr) => parseInt(numstr));
    // Creating a date this way uses local time, but values are UTC, so offset needs to be applied
    let localdate = new Date(
        numbers[0],
        numbers[1] - 1,
        numbers[2],
        numbers[3],
        numbers[4],
        numbers[5]
    );
    return ToUTCDate(localdate);
}


/**
 * Converts a localized date (From flatpickr) to a UTC time.
 * Dates are returned in local time, but the datepicker is meant for UTC time.
 * So for example when I (US/Eastern) choose 12:00PM UTC, I am returned 12:00PM Eastern (which is 8am UTC, which is not what I intended to select);
 * This function applies the time zome offset to convert that 12:00PM Eastern into 12:00PM UTC.
 * The function is generic and works for all time zones.
 * @param {Date} date
 */
function ToUTCDate(date) {
    let date_copy = new Date(date);
    date_copy.setMinutes(date_copy.getMinutes() - date.getTimezoneOffset());
    return date_copy;
}

async function _GetClosestImage(source, time) {
    let api_url =
        "https://api.helioviewer.org/v2/getClosestImage/?sourceId=" +
        source +
        "&date=" +
        ToAPIDate(time);
    let result = await fetch(api_url);
    let image = await result.json();
    // Add the Z to indicate the date is a UTC date. Helioviewer works in UTC
    // but doesn't use the formal specification for it.
    return {
        id: image.id,
        timestamp: parseDate(image.date),
        jp2_info: {
            width: image.width,
            height: image.height,
            solar_center_x: image.refPixelX,
            solar_center_y: image.refPixelY,
            solar_radius: image.rsun,
        },
    };
}

const loader = new THREE.TextureLoader();

function CreatePlane(textureUrl) {
    const geometry = new THREE.PlaneGeometry( 2.6, 2.6 );
    const material = new THREE.MeshBasicMaterial();
    material.map = loader.load(textureUrl);
    const plane = new THREE.Mesh( geometry, material );
    return plane;
}


function LineToObserver(start, end) {
    //create a blue LineBasicMaterial
    const material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );
    const points = [];
    points.push(start.clone());
    points.push(end.clone());
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const line = new THREE.Line( geometry, material );
    return line;
}

async function DrawHMI(scene, date) {
    let metadata = await _GetClosestImage(19, date);
    let imageUrl = "https://api.helioviewer.org/v2/downloadImage/?id=" + metadata.id + "&scale=" + 1
    let observerPositionUrl = "https://api.gl.helioviewer.org/observer/position?id=" + metadata.id;
    let result = await fetch(observerPositionUrl);
    let observer = await result.json();
    let plane = CreatePlane(imageUrl);
    let pos = new THREE.Vector3(observer.x, observer.y, observer.z);
    plane.lookAt(pos);
    console.log(metadata);
    let line = LineToObserver(plane.position, pos);
    scene.add(plane);
    scene.add(line);
}

export { DrawHMI }