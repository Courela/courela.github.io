function bindLogin() {
    $('#login').on('click', async function(){
        $('#spinner').show();
        await login();
        $('#spinner').hide();
    });
}
