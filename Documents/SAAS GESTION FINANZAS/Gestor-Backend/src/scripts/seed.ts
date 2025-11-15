import mongoose from 'mongoose';
import * as readline from 'readline';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User } from '../models/User.model';
import { Gasto } from '../models/Gasto.model';
import { Ingreso } from '../models/Ingreso.model';
import { Categoria } from '../models/Categoria.model';
import { Presupuesto } from '../models/Presupuesto.model';
import { Amigo } from '../models/Amigo.model';
import { MensajeChat } from '../models/MensajeChat.model';
import { Mensaje } from '../models/Mensaje.model';
import { Notificacion } from '../models/Notificacion.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://pablomaldonado422_db_user:Mbt3ylAXTIBSzhku@cluster0.tgnhplr.mongodb.net/gestor-finanzas?retryWrites=true&w=majority&appName=Cluster0';

// Modo no interactivo: si se pasa --yes o -y como argumento, acepta todo automáticamente
const MODO_NO_INTERACTIVO = process.argv.includes('--yes') || process.argv.includes('-y');

// Interface para readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para preguntar confirmación
const pregunta = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    if (MODO_NO_INTERACTIVO) {
      console.log(`${query}s (auto-confirmado)`);
      resolve('s');
    } else {
      rl.question(query, resolve);
    }
  });
};

const confirmar = async (mensaje: string): Promise<boolean> => {
  if (MODO_NO_INTERACTIVO) {
    console.log(`${mensaje} (s/n): s (auto-confirmado)`);
    return true;
  }
  const respuesta = await pregunta(`${mensaje} (s/n): `);
  return respuesta.toLowerCase() === 's' || respuesta.toLowerCase() === 'si' || respuesta.toLowerCase() === 'y' || respuesta.toLowerCase() === 'yes';
};

// Función para conectar a MongoDB
const conectarDB = async (): Promise<void> => {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB conectado exitosamente\n');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    process.exit(1);
  }
};

// Función para limpiar la base de datos
const limpiarDB = async (): Promise<void> => {
  const confirmarLimpiar = await confirmar('⚠️  ¿Deseas limpiar TODAS las colecciones antes de crear los seeds?');
  
  if (!confirmarLimpiar) {
    console.log('⏭️  Saltando limpieza de base de datos\n');
    return;
  }

  try {
    console.log('🗑️  Limpiando base de datos...');
    await User.deleteMany({});
    await Gasto.deleteMany({});
    await Ingreso.deleteMany({});
    await Categoria.deleteMany({});
    await Presupuesto.deleteMany({});
    await Amigo.deleteMany({});
    await MensajeChat.deleteMany({});
    await Mensaje.deleteMany({});
    await Notificacion.deleteMany({});
    console.log('✅ Base de datos limpiada exitosamente\n');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    throw error;
  }
};

// Crear usuarios
const crearUsuarios = async (): Promise<{ regular: mongoose.Types.ObjectId; admin: mongoose.Types.ObjectId }> => {
  const confirmarCrear = await confirmar('👤 ¿Crear usuarios (regular y admin)?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de usuarios\n');
    return { regular: new mongoose.Types.ObjectId(), admin: new mongoose.Types.ObjectId() };
  }

  try {
    console.log('👤 Creando usuarios...');
    
    // Hashear contraseñas
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Usuario regular
    const usuarioRegular = await User.create({
      email: 'usuario@example.com',
      password: passwordHash,
      nombre: 'Usuario Regular',
      descripcion: 'Usuario de prueba regular',
      role: 'regular'
    });
    
    // Usuario admin
    const usuarioAdmin = await User.create({
      email: 'admin@example.com',
      password: passwordHash,
      nombre: 'Administrador',
      descripcion: 'Usuario administrador del sistema',
      role: 'admin'
    });
    
    console.log(`✅ Usuario regular creado: ${usuarioRegular.email} (ID: ${usuarioRegular._id})`);
    console.log(`✅ Usuario admin creado: ${usuarioAdmin.email} (ID: ${usuarioAdmin._id})\n`);
    
    return {
      regular: usuarioRegular._id,
      admin: usuarioAdmin._id
    };
  } catch (error) {
    console.error('❌ Error al crear usuarios:', error);
    throw error;
  }
};

// Crear categorías
const crearCategorias = async (userId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId[]> => {
  const confirmarCrear = await confirmar('🏷️  ¿Crear categorías?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de categorías\n');
    return [];
  }

  try {
    console.log('🏷️  Creando categorías...');
    
    const categorias = [
      { nombre: 'Alimentación', tipo: 'gastos' as const },
      { nombre: 'Transporte', tipo: 'gastos' as const },
      { nombre: 'Vivienda', tipo: 'gastos' as const },
      { nombre: 'Servicios', tipo: 'gastos' as const },
      { nombre: 'Entretenimiento', tipo: 'gastos' as const },
      { nombre: 'Salud', tipo: 'gastos' as const },
      { nombre: 'Salario', tipo: 'ingresos' as const },
      { nombre: 'Freelance', tipo: 'ingresos' as const },
      { nombre: 'Inversiones', tipo: 'ingresos' as const },
      { nombre: 'Personalizada', tipo: 'ambos' as const }
    ];
    
    const categoriasCreadas = await Categoria.insertMany(
      categorias.map(cat => ({ ...cat, userId }))
    );
    
    console.log(`✅ ${categoriasCreadas.length} categorías creadas\n`);
    return categoriasCreadas.map(c => c._id);
  } catch (error) {
    console.error('❌ Error al crear categorías:', error);
    throw error;
  }
};

// Crear gastos
const crearGastos = async (userId: mongoose.Types.ObjectId, amigoId?: mongoose.Types.ObjectId): Promise<void> => {
  const confirmarCrear = await confirmar('💸 ¿Crear gastos?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de gastos\n');
    return;
  }

  try {
    console.log('💸 Creando gastos...');
    
    // Obtener mes actual en minúsculas (enero, febrero, etc.)
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesActual = meses[new Date().getMonth()];
    const fechaActual = new Date();
    
    const gastos = [
      {
        userId,
        descripcion: 'Supermercado semanal',
        monto: 85.50,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 5),
        categoria: 'Alimentación',
        mes: mesActual
      },
      {
        userId,
        descripcion: 'Gasolina',
        monto: 45.00,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 8),
        categoria: 'Transporte',
        mes: mesActual
      },
      {
        userId,
        descripcion: 'Alquiler',
        monto: 600.00,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1),
        categoria: 'Vivienda',
        mes: mesActual,
        dividido: amigoId ? [{
          amigoId,
          amigoNombre: 'Amigo de Prueba',
          montoDividido: 300.00,
          pagado: false
        }] : []
      },
      {
        userId,
        descripcion: 'Luz y agua',
        monto: 120.00,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 10),
        categoria: 'Servicios',
        mes: mesActual
      },
      {
        userId,
        descripcion: 'Cine',
        monto: 25.00,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 15),
        categoria: 'Entretenimiento',
        mes: mesActual
      }
    ];
    
    const gastosCreados = await Gasto.insertMany(gastos);
    console.log(`✅ ${gastosCreados.length} gastos creados\n`);
  } catch (error) {
    console.error('❌ Error al crear gastos:', error);
    throw error;
  }
};

// Crear ingresos
const crearIngresos = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  const confirmarCrear = await confirmar('💰 ¿Crear ingresos?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de ingresos\n');
    return;
  }

  try {
    console.log('💰 Creando ingresos...');
    
    // Obtener mes actual en minúsculas (enero, febrero, etc.)
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesActual = meses[new Date().getMonth()];
    const fechaActual = new Date();
    
    const ingresos = [
      {
        userId,
        descripcion: 'Salario mensual',
        monto: 2500.00,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1),
        categoria: 'Salario',
        mes: mesActual
      },
      {
        userId,
        descripcion: 'Proyecto freelance',
        monto: 500.00,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 12),
        categoria: 'Freelance',
        mes: mesActual
      },
      {
        userId,
        descripcion: 'Dividendos',
        monto: 150.00,
        fecha: new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 20),
        categoria: 'Inversiones',
        mes: mesActual
      }
    ];
    
    const ingresosCreados = await Ingreso.insertMany(ingresos);
    console.log(`✅ ${ingresosCreados.length} ingresos creados\n`);
  } catch (error) {
    console.error('❌ Error al crear ingresos:', error);
    throw error;
  }
};

// Crear presupuestos
const crearPresupuestos = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  const confirmarCrear = await confirmar('📊 ¿Crear presupuestos?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de presupuestos\n');
    return;
  }

  try {
    console.log('📊 Creando presupuestos...');
    
    // Obtener mes actual en minúsculas (enero, febrero, etc.)
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const mesActual = meses[new Date().getMonth()];
    const totalIngresos = 3150.00; // Suma de los ingresos creados
    
    const presupuestos = [
      {
        userId,
        mes: mesActual,
        categoria: 'Alimentación',
        monto: 300.00,
        porcentaje: (300 / totalIngresos) * 100,
        totalIngresos
      },
      {
        userId,
        mes: mesActual,
        categoria: 'Transporte',
        monto: 200.00,
        porcentaje: (200 / totalIngresos) * 100,
        totalIngresos
      },
      {
        userId,
        mes: mesActual,
        categoria: 'Vivienda',
        monto: 600.00,
        porcentaje: (600 / totalIngresos) * 100,
        totalIngresos
      },
      {
        userId,
        mes: mesActual,
        categoria: 'Servicios',
        monto: 150.00,
        porcentaje: (150 / totalIngresos) * 100,
        totalIngresos
      },
      {
        userId,
        mes: mesActual,
        categoria: 'Entretenimiento',
        monto: 100.00,
        porcentaje: (100 / totalIngresos) * 100,
        totalIngresos
      }
    ];
    
    const presupuestosCreados = await Presupuesto.insertMany(presupuestos);
    console.log(`✅ ${presupuestosCreados.length} presupuestos creados\n`);
  } catch (error) {
    console.error('❌ Error al crear presupuestos:', error);
    throw error;
  }
};

// Crear amigos
const crearAmigos = async (userId: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId[]> => {
  const confirmarCrear = await confirmar('👥 ¿Crear amigos?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de amigos\n');
    return [];
  }

  try {
    console.log('👥 Creando amigos...');
    
    // Crear usuarios adicionales para usar como amigos
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const usuarioAmigo1 = await User.create({
      email: 'juan.perez@example.com',
      password: passwordHash,
      nombre: 'Juan Pérez',
      descripcion: 'Amigo de prueba',
      role: 'regular'
    });
    
    const usuarioAmigo2 = await User.create({
      email: 'maria.garcia@example.com',
      password: passwordHash,
      nombre: 'María García',
      descripcion: 'Amiga de prueba',
      role: 'regular'
    });
    
    const usuarioAmigo3 = await User.create({
      email: 'carlos.lopez@example.com',
      password: passwordHash,
      nombre: 'Carlos López',
      descripcion: 'Amigo de prueba',
      role: 'regular'
    });
    
    // Crear relaciones de amistad con los nuevos campos
    const amigos = [
      {
        userId,
        amigoUserId: usuarioAmigo1._id,
        nombre: usuarioAmigo1.nombre,
        email: usuarioAmigo1.email,
        avatar: usuarioAmigo1.avatar,
        estado: 'activo' as const,
        solicitadoPor: userId,
        fechaAmistad: new Date()
      },
      {
        userId,
        amigoUserId: usuarioAmigo2._id,
        nombre: usuarioAmigo2.nombre,
        email: usuarioAmigo2.email,
        avatar: usuarioAmigo2.avatar,
        estado: 'activo' as const,
        solicitadoPor: userId,
        fechaAmistad: new Date()
      },
      {
        userId,
        amigoUserId: usuarioAmigo3._id,
        nombre: usuarioAmigo3.nombre,
        email: usuarioAmigo3.email,
        avatar: usuarioAmigo3.avatar,
        estado: 'pendiente' as const,
        solicitadoPor: userId
      }
    ];
    
    const amigosCreados = await Amigo.insertMany(amigos);
    console.log(`✅ ${amigosCreados.length} amigos creados\n`);
    return amigosCreados.map(a => a._id);
  } catch (error) {
    console.error('❌ Error al crear amigos:', error);
    throw error;
  }
};

// Crear mensajes de chat
const crearMensajesChat = async (userId: mongoose.Types.ObjectId, amigoIds: mongoose.Types.ObjectId[]): Promise<void> => {
  const confirmarCrear = await confirmar('💬 ¿Crear mensajes de chat?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de mensajes de chat\n');
    return;
  }

  if (amigoIds.length === 0) {
    console.log('⚠️  No hay amigos creados, saltando mensajes de chat\n');
    return;
  }

  try {
    console.log('💬 Creando mensajes de chat...');
    
    const mensajes = [
      {
        remitenteId: userId,
        destinatarioId: userId, // Simulado
        amigoId: amigoIds[0],
        contenido: 'Hola, ¿cómo estás?',
        esSistema: false,
        leido: false
      },
      {
        remitenteId: userId,
        destinatarioId: userId,
        amigoId: amigoIds[0],
        contenido: 'Recordatorio de pago: Debes pagar 300.00€ por el gasto "Alquiler"',
        esSistema: true,
        leido: false
      },
      {
        remitenteId: userId,
        destinatarioId: userId,
        amigoId: amigoIds[1],
        contenido: '¿Quieres ir al cine este fin de semana?',
        esSistema: false,
        leido: true
      }
    ];
    
    const mensajesCreados = await MensajeChat.insertMany(mensajes);
    console.log(`✅ ${mensajesCreados.length} mensajes de chat creados\n`);
  } catch (error) {
    console.error('❌ Error al crear mensajes de chat:', error);
    throw error;
  }
};

// Crear mensajes
const crearMensajes = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  const confirmarCrear = await confirmar('✉️  ¿Crear mensajes?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de mensajes\n');
    return;
  }

  try {
    console.log('✉️  Creando mensajes...');
    
    const mensajes = [
      {
        userId,
        remitente: 'Sistema',
        asunto: 'Bienvenido a Gestor Finanzas',
        contenido: 'Gracias por registrarte en nuestro sistema de gestión financiera.',
        leido: false
      },
      {
        userId,
        remitente: 'Soporte',
        asunto: 'Recordatorio: Configura tu presupuesto',
        contenido: 'Te recordamos que puedes configurar tus presupuestos mensuales desde la sección de distribución.',
        leido: false
      },
      {
        userId,
        remitente: 'Administrador',
        asunto: 'Actualización del sistema',
        contenido: 'Se han implementado nuevas funcionalidades en el dashboard.',
        leido: true
      }
    ];
    
    const mensajesCreados = await Mensaje.insertMany(mensajes);
    console.log(`✅ ${mensajesCreados.length} mensajes creados\n`);
  } catch (error) {
    console.error('❌ Error al crear mensajes:', error);
    throw error;
  }
};

// Crear notificaciones
const crearNotificaciones = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  const confirmarCrear = await confirmar('🔔 ¿Crear notificaciones?');
  
  if (!confirmarCrear) {
    console.log('⏭️  Saltando creación de notificaciones\n');
    return;
  }

  try {
    console.log('🔔 Creando notificaciones...');
    
    const notificaciones = [
      {
        userId,
        tipo: 'success' as const,
        titulo: 'Presupuesto configurado',
        mensaje: 'Has configurado tu presupuesto mensual correctamente.',
        leida: false
      },
      {
        userId,
        tipo: 'info' as const,
        titulo: 'Nuevo ingreso registrado',
        mensaje: 'Se ha registrado un nuevo ingreso de 500.00€.',
        leida: false
      },
      {
        userId,
        tipo: 'warning' as const,
        titulo: 'Presupuesto cerca del límite',
        mensaje: 'Tu presupuesto de Alimentación está al 85% del límite.',
        leida: false
      },
      {
        userId,
        tipo: 'error' as const,
        titulo: 'Presupuesto excedido',
        mensaje: 'Has excedido el presupuesto de Transporte en 50.00€.',
        leida: true
      }
    ];
    
    const notificacionesCreadas = await Notificacion.insertMany(notificaciones);
    console.log(`✅ ${notificacionesCreadas.length} notificaciones creadas\n`);
  } catch (error) {
    console.error('❌ Error al crear notificaciones:', error);
    throw error;
  }
};

// Función principal
const ejecutarSeed = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando script de seed...\n');
    
    // Conectar a la base de datos
    await conectarDB();
    
    // Verificar conexión
    const confirmarConexion = await confirmar('✅ Conexión establecida. ¿Continuar con el seed?');
    if (!confirmarConexion) {
      console.log('❌ Seed cancelado por el usuario');
      await mongoose.disconnect();
      rl.close();
      return;
    }
    
    console.log('');
    
    // Limpiar base de datos
    await limpiarDB();
    
    // Crear usuarios
    const { regular: userIdRegular } = await crearUsuarios();
    
    // Usar usuario regular para el resto de datos
    const userId = userIdRegular;
    
    // Crear categorías
    await crearCategorias(userId);
    
    // Crear amigos
    const amigoIds = await crearAmigos(userId);
    
    // Crear gastos
    await crearGastos(userId, amigoIds[0]);
    
    // Crear ingresos
    await crearIngresos(userId);
    
    // Crear presupuestos
    await crearPresupuestos(userId);
    
    // Crear mensajes de chat
    await crearMensajesChat(userId, amigoIds);
    
    // Crear mensajes
    await crearMensajes(userId);
    
    // Crear notificaciones
    await crearNotificaciones(userId);
    
    // Resumen final
    console.log('📊 Resumen del seed:');
    const counts = {
      usuarios: await User.countDocuments(),
      gastos: await Gasto.countDocuments(),
      ingresos: await Ingreso.countDocuments(),
      categorias: await Categoria.countDocuments(),
      presupuestos: await Presupuesto.countDocuments(),
      amigos: await Amigo.countDocuments(),
      mensajesChat: await MensajeChat.countDocuments(),
      mensajes: await Mensaje.countDocuments(),
      notificaciones: await Notificacion.countDocuments()
    };
    
    console.log(`  - Usuarios: ${counts.usuarios}`);
    console.log(`  - Gastos: ${counts.gastos}`);
    console.log(`  - Ingresos: ${counts.ingresos}`);
    console.log(`  - Categorías: ${counts.categorias}`);
    console.log(`  - Presupuestos: ${counts.presupuestos}`);
    console.log(`  - Amigos: ${counts.amigos}`);
    console.log(`  - Mensajes de Chat: ${counts.mensajesChat}`);
    console.log(`  - Mensajes: ${counts.mensajes}`);
    console.log(`  - Notificaciones: ${counts.notificaciones}`);
    
    console.log('\n✅ Seed completado exitosamente!');
    
    // Desconectar
    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
};

// Ejecutar seed
ejecutarSeed();

