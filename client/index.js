module.exports = {
    holaMundo: function() {
        console.log('Hola Mundo!');
    },
    holaPersonalizado: function(nombre) {
        if (nombre) {
             console.log(`Hola ${ nombre }`);
             return;
        }
        console.log('Hola, ¿Hay alguien ahí?')
    }
}