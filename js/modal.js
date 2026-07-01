function showModal(message) {
    $('#appModal').find('p').text(message);
    $('#appModal').css('display', 'block');

    $('.close').on('click', function() {
        $('#modal').css('display', 'none');
    });
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == $('#appModal')[0]) {
    $('#appModal').css('display', 'none');
  }
}
