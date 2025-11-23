import mongoose from 'mongoose';
import * as readline from 'readline';
import dotenv from 'dotenv';
import { Categoria } from '../models/Categoria.model';

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

// Conectar a la base de datos
const conectarDB = async (): Promise<void> => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    throw error;
  }
};

// Función principal de migración
const migrarSubcategorias = async (): Promise<void> => {
  try {
    console.log('🔄 Iniciando migración de subcategorías...\n');

    // Buscar todas las categorías que no tienen el campo subcategorias o que es undefined/null
    const categoriasSinSubcategorias = await Categoria.find({
      $or: [
        { subcategorias: { $exists: false } },
        { subcategorias: null },
        { subcategorias: undefined }
      ]
    });

    console.log(`📊 Categorías encontradas sin subcategorías: ${categoriasSinSubcategorias.length}`);

    if (categoriasSinSubcategorias.length === 0) {
      console.log('✅ Todas las categorías ya tienen el campo subcategorias. No se requiere migración.\n');
      return;
    }

    // Mostrar algunas categorías que se van a actualizar
    console.log('\n📋 Categorías que se actualizarán:');
    categoriasSinSubcategorias.slice(0, 10).forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.nombre} (${cat.tipo}) - ID: ${cat._id}`);
    });
    if (categoriasSinSubcategorias.length > 10) {
      console.log(`   ... y ${categoriasSinSubcategorias.length - 10} más`);
    }

    // Confirmar antes de proceder
    const confirmarMigracion = await confirmar('\n⚠️  ¿Deseas continuar con la migración?');
    if (!confirmarMigracion) {
      console.log('❌ Migración cancelada por el usuario\n');
      return;
    }

    console.log('\n🔄 Actualizando categorías...');

    // Actualizar todas las categorías que no tienen subcategorias
    // Usamos updateMany para actualizar todas de una vez de forma segura
    const resultado = await Categoria.updateMany(
      {
        $or: [
          { subcategorias: { $exists: false } },
          { subcategorias: null },
          { subcategorias: undefined }
        ]
      },
      {
        $set: { subcategorias: [] }
      }
    );

    console.log(`✅ Migración completada:`);
    console.log(`   - Categorías actualizadas: ${resultado.modifiedCount}`);
    console.log(`   - Categorías que ya tenían subcategorias: ${resultado.matchedCount - resultado.modifiedCount}`);
    console.log('');

    // Verificar que la migración fue exitosa
    const categoriasVerificacion = await Categoria.find({
      $or: [
        { subcategorias: { $exists: false } },
        { subcategorias: null },
        { subcategorias: undefined }
      ]
    });

    if (categoriasVerificacion.length === 0) {
      console.log('✅ Verificación exitosa: Todas las categorías ahora tienen el campo subcategorias\n');
    } else {
      console.log(`⚠️  Advertencia: ${categoriasVerificacion.length} categorías aún no tienen el campo subcategorias\n`);
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
};

// Función principal
const ejecutarMigracion = async (): Promise<void> => {
  try {
    console.log('🌱 Iniciando script de migración de subcategorías...\n');

    // Conectar a la base de datos
    await conectarDB();

    // Verificar conexión
    const confirmarConexion = await confirmar('✅ Conexión establecida. ¿Continuar con la migración?');
    if (!confirmarConexion) {
      console.log('❌ Migración cancelada por el usuario');
      await mongoose.disconnect();
      rl.close();
      return;
    }

    console.log('');

    // Ejecutar migración
    await migrarSubcategorias();

    // Resumen final
    const totalCategorias = await Categoria.countDocuments();
    const categoriasConSubcategorias = await Categoria.countDocuments({
      subcategorias: { $exists: true, $ne: null }
    });

    console.log('📊 Resumen final:');
    console.log(`   - Total de categorías: ${totalCategorias}`);
    console.log(`   - Categorías con campo subcategorias: ${categoriasConSubcategorias}`);
    console.log(`   - Categorías sin campo subcategorias: ${totalCategorias - categoriasConSubcategorias}`);
    console.log('');

    // Desconectar
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    rl.close();

  } catch (error) {
    console.error('❌ Error fatal:', error);
    await mongoose.disconnect();
    rl.close();
    process.exit(1);
  }
};

// Ejecutar migración
ejecutarMigracion();

