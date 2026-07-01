function showModal(message, timeout) {
    $('#appModal').find('p').text(message);
    $('#appModal').css('display', 'block');

    $('.close').on('click', function() {
        $('#modal').css('display', 'none');
    });

    if (timeout) {
        setTimeout(function() {
            $('#modal').css('display', 'none');
        }, timeout);
    }
}   

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == $('#appModal')[0]) {
    $('#appModal').css('display', 'none');
  }
}
