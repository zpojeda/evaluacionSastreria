const express = require('express');
const app = express();
// Middleware to parse JSON requests
app.use(express.json());
const PORT = 3000;
app.get('/', (req, res) => {
    res.send('Bienvenidos a la API de Sastrería Hilo y Estilo');
});

let solicitudes = [
    {
        id: 1,
        cliente: "Ana", 
        prenda: 'pantalón',
        costo: 35000,
        estado:'pendiente'
    }, 
       {
        id: 2,
        cliente: "Maria", 
        prenda: 'vestido',
        costo: 80000,
        estado:'entregada'
    }, 
       {
        id: 3,
        cliente: "Carlos", 
        prenda: 'camisa',
        costo: 10000,
        estado:'lista'
    }, 
       {
        id: 4,
        cliente: "Luis", 
        prenda: 'chaqueta',
        costo: 60000,
        estado:'pendiente'
    }
    ];

    // punto 1
    app.get('/solicitudes', (req, res) => {
        res.json(solicitudes);
    });

    // punto 2

    app.get('/solicitudes/:id', (req, res) => {
        const id = Number(req.params.id);
        const solicitud = solicitudes.find(s => s.id === id);
        if (!solicitud) {
            return res.status(404).json({ 
                mensaje: 'Solicitud no encontrada' 
            });

        }
        res.json(solicitud);
    });

    // punto 3 filtren por estado

    app.get('/solicitudes/estado/:estado', (req, res) => {
        const estado = req.params.estado.toLowerCase();
        const resultado = solicitudes.filter(
            s => s.estado.toLowerCase() === estado
        );
        res.json(resultado);
    }); 

    // punto 4 POST 

    app.post('/solicitudes',(req, res) => {
        const { cliente, prenda, costo, estado } = req.body;

        if(
            typeof cliente !== 'string' ||
            cliente.trim() === '' ||
            typeof prenda !== 'string' ||
            prenda.trim() === '' ||
            typeof costo !== 'number' ||
            costo <= 0 ||
            typeof estado !== 'string' ||
            estado.trim() === ''
        ) {
            return res.status(400).json({
                mensaje: 'Los campos son obligatorios y deben ser válidos'
            });
        }

        const prendaNormalizada = prenda.trim().toLowerCase();
        const prendasPermitidas = [
            'pantalón',
            'vestido',
            'camisa',
            'chaqueta'
        ];
        if (!prendasPermitidas.includes(prendaNormalizada)) {
            return res.status(400).json({
                mensaje: 'Tipo de prenda no permitida'
            });
        }

        if (
            typeof costo !== 'number' ||
            !Number.isInteger(costo) ||
            costo <= 0
        ) {
            return res.status(400).json({
                mensaje: 'El costo debe ser un número mayor que cero'
            });
        }

        if ( typeof estado !== 'string'){
            return res.status(400).json({
                mensaje: 'El estado no es valido'
            });
        }

        const estadoNormalizado = estado.trim().toLowerCase();
        const estadosPermitidos =[
            'pendiente',
            'entregada',
            'lista'
        ]; 

        if (!estadosPermitidos.includes(estadoNormalizado)) {
            return res.status(400).json({
                mensaje: 'Estado no permitido'
            });
        }

        const duplicada = solicitudes.some( s =>
            s.cliente.toLowerCase() === cliente.trim().toLowerCase() &&
            s.prenda.toLowerCase() === prendaNormalizada &&
            s.estado.toLowerCase() === 'pendiente' &&
            estadoNormalizado === 'pendiente'
        );

        if (duplicada){
            return res.status(400).json({
                mensaje: 'Ya existe una solicitud pendiente para este cliente y prenda'
            });
        }

        const nuevoId = solicitudes.length > 0
        ? Math.max(...solicitudes.map(s => s.id)) + 1
        : 1;

        const nuevaSolicitud ={
            id: nuevoId,
            cliente: cliente.trim(),
            prenda: prendaNormalizada,
            costo,
            estado: estadoNormalizado
        };
        solicitudes.push(nuevaSolicitud);
        res.status(201).json({
            mensaje: 'Solicitud creada exitosamente',
            solicitud: nuevaSolicitud
        });
    }); 

    // editar 
    app.put('/solicitudes/:id', (req, res) => {
        const id = Number(req.params.id);
        const solicitud = solicitudes.find(
            s => s.id === id
        ); 

        if (!solicitud) {
            return res.status(404).json({
                mensaje:'Solicitud no encontrada'
            });
        }

        if (solicitud.estado.toLowerCase() === 'entregada'){
            return res.status(400).json({
                mensaje: 'No se puede modificar la solicitud  en estado entregada'
            });
        }

        const {cliente, prenda, costo, estado} = req.body;
        if (
            typeof cliente !== 'string' ||
            cliente.trim() === '' ||
            typeof prenda !== 'string' ||
            prenda.trim() === '' ||
            typeof costo !== 'number' ||
            !Number.isFinite(costo) ||
            costo <=0 ||
            typeof estado !== 'string' ||
            estado.trim() === ''

        ){
            return res.status(400).json({
                mensaje: 'datos obligatorios o invalidos' 
            });
        }

        const prendaNueva = prenda.trim().toLowerCase();
        const estadoNuevo = estado.trim().toLowerCase();

        const prendasPermitidas =[
            'pantalon', 'vestido',
            'camisa', 'chaqueta'
        ];
        if (!prendasPermitidas.includes(prendaNueva)) {
            return res.status(400).json({
                mensaje: 'Prenda no permitida'
            });
        }

        const estadoPermitidos =[
            'pendiente', 'lista','entregada'
        ];

        if(!estadoPermitidos.includes(estadoNuevo)){
            return res.status(400).json({
                mensaje: 'Estado no permitido'
            });
        }
            const duplicada = solicitudes.some( s =>
            s.id !== id &&
            s.cliente.toLowerCase() === cliente.trim().toLocaleLowerCase() &&
            s.prenda.toLowerCase() === prendaNueva &&
            s.estado.toLowerCase() === 'pendiente' &&
            estadoNuevo === 'pendiente'
        );

        if (duplicada){
            return res.status(400).json({
                mensaje: 'Ya existe otra  solicitud pendiente '
            });
        }

        solicitud.cliente = cliente.trim();
        solicitud.prenda = prendaNueva;
        solicitud.costo = costo;
        solicitud.estado = estadoNuevo; 


    

        res.json({
            mensaje: 'Solicitud actualizada correctamente',
            solicitud : solicitud
        });

             }

    );

    app.delete('/solicitudes/:id', (req, res) =>{
        const id = Number(req.params.id)
        const indice = solicitudes.findIndex(
            s => s.id === id
        ); 
        
        if (indice === -1){
            return res.status(404).json({
                mensaje:'Solicitud no encientrada'
            });
        }

        if (solicitudes[indice].estado.toLowerCase() === 'entregada'){
            return res.status(400).json({
                mensaje: 'No se puede eliminar una solicitud entregada'
            });
        }

        solicitudes.splice(indice, 1);

        res.json({
            mensaje: 'Solicitud eliminada correctamente'
        });
    });



app.listen(PORT, () =>{
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});



