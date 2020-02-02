function initMapUi(mapId,pos) {
    let map = new google.maps.Map(document.getElementById(mapId), {
        zoom: 10,
        center: pos,
        zoomControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
    });
    return map;
}

function initSearchBox(map,inputId,addToControls){
    // Create the search box and link it to the UI element.
    let input = document.getElementById(inputId);
    let searchBox = new google.maps.places.SearchBox(input);
    if (addToControls){
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    }
    return searchBox;
}

function clearMarker(marker){
    marker.setMap(null);
}

function addMarkerToMap(map,pos,moveCamera){
    let marker = new google.maps.Marker({
        position: pos,
        map: map
    });
    if (moveCamera){
        //move camera to position
        map.panTo(pos);
    }
    return marker;
}

function addInfoWindow(map,marker,contentString,openDefault=true){
    let infoWindow = new google.maps.InfoWindow({
        content: contentString
    });
    if (openDefault===true){
        infoWindow.open(map,marker);
    }
    return infoWindow;
}