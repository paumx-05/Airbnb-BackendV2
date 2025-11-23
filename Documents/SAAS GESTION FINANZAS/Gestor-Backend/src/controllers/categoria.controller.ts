import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Categoria } from '../models/Categoria.model';

// Obtener todas las categorías del usuario
export const getCategorias = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const categorias = await Categoria.find({ userId: req.user.userId })
      .sort({ nombre: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: categorias.map(categoria => ({
        _id: categoria._id.toString(),
        userId: categoria.userId.toString(),
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        subcategorias: categoria.subcategorias || [],
        createdAt: categoria.createdAt instanceof Date 
          ? categoria.createdAt.toISOString() 
          : categoria.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías'
    });
  }
};

// Obtener categorías por tipo
export const getCategoriasByTipo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { tipo } = req.params;

    // Validar tipo
    const tiposValidos = ['gastos', 'ingresos', 'ambos'];
    const tipoNormalizado = tipo.toLowerCase().trim();

    if (!tiposValidos.includes(tipoNormalizado)) {
      res.status(400).json({
        success: false,
        error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
      });
      return;
    }

    const categorias = await Categoria.find({ 
      userId: req.user.userId, 
      tipo: tipoNormalizado 
    })
      .sort({ nombre: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: categorias.map(categoria => ({
        _id: categoria._id.toString(),
        userId: categoria.userId.toString(),
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        subcategorias: categoria.subcategorias || [],
        createdAt: categoria.createdAt instanceof Date 
          ? categoria.createdAt.toISOString() 
          : categoria.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías por tipo'
    });
  }
};

// Crear una nueva categoría
export const createCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { nombre, tipo, subcategorias } = req.body;

    // Validar nombre
    if (!nombre || nombre.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      });
      return;
    }

    // Validar tipo
    const tiposValidos = ['gastos', 'ingresos', 'ambos'];
    if (!tipo || !tiposValidos.includes(tipo.toLowerCase().trim())) {
      res.status(400).json({
        success: false,
        error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
      });
      return;
    }

    // Validar subcategorías (opcional)
    if (subcategorias !== undefined) {
      if (!Array.isArray(subcategorias)) {
        res.status(400).json({
          success: false,
          error: 'Subcategorías debe ser un array'
        });
        return;
      }

      if (subcategorias.length > 20) {
        res.status(400).json({
          success: false,
          error: 'Máximo 20 subcategorías permitidas'
        });
        return;
      }

      // Validar que no haya subcategorías vacías
      const subcategoriasValidas = subcategorias.filter(s => 
        typeof s === 'string' && s.trim().length > 0
      );

      if (subcategoriasValidas.length !== subcategorias.length) {
        res.status(400).json({
          success: false,
          error: 'Todas las subcategorías deben ser textos válidos'
        });
        return;
      }
    }

    const nombreNormalizado = nombre.trim();
    const tipoNormalizado = tipo.toLowerCase().trim();

    // Validar nombre único por usuario
    const categoriaExistente = await Categoria.findOne({
      userId: req.user.userId,
      nombre: nombreNormalizado
    });

    if (categoriaExistente) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una categoría con ese nombre'
      });
      return;
    }

    // Crear nueva categoría
    const nuevaCategoria = new Categoria({
      userId: req.user.userId,
      nombre: nombreNormalizado,
      tipo: tipoNormalizado,
      subcategorias: subcategorias ? subcategorias.map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []
    });

    await nuevaCategoria.save();

    res.status(201).json({
      success: true,
      data: {
        _id: nuevaCategoria._id.toString(),
        userId: nuevaCategoria.userId.toString(),
        nombre: nuevaCategoria.nombre,
        tipo: nuevaCategoria.tipo,
        subcategorias: nuevaCategoria.subcategorias || [],
        createdAt: nuevaCategoria.createdAt.toISOString()
      },
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una categoría con ese nombre'
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Error al crear categoría'
    });
  }
};

// Actualizar una categoría existente
export const updateCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;
    const { nombre, tipo, subcategorias } = req.body;

    // Buscar categoría
    const categoria = await Categoria.findOne({ _id: id, userId: req.user.userId });

    if (!categoria) {
      res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
      return;
    }

    // Validar y actualizar nombre si se proporciona
    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío'
        });
        return;
      }

      const nombreNormalizado = nombre.trim();

      // Validar nombre único por usuario (excluyendo la categoría actual)
      const categoriaExistente = await Categoria.findOne({
        userId: req.user.userId,
        nombre: nombreNormalizado,
        _id: { $ne: id }
      });

      if (categoriaExistente) {
        res.status(409).json({
          success: false,
          error: 'Ya existe una categoría con ese nombre'
        });
        return;
      }

      categoria.nombre = nombreNormalizado;
    }

    // Validar y actualizar tipo si se proporciona
    if (tipo !== undefined) {
      const tiposValidos = ['gastos', 'ingresos', 'ambos'];
      const tipoNormalizado = tipo.toLowerCase().trim();

      if (!tiposValidos.includes(tipoNormalizado)) {
        res.status(400).json({
          success: false,
          error: 'Tipo inválido. Debe ser: gastos, ingresos o ambos'
        });
        return;
      }

      categoria.tipo = tipoNormalizado;
    }

    // Actualizar subcategorías (si se proporciona)
    if (subcategorias !== undefined) {
      if (!Array.isArray(subcategorias)) {
        res.status(400).json({
          success: false,
          error: 'Subcategorías debe ser un array'
        });
        return;
      }

      if (subcategorias.length > 20) {
        res.status(400).json({
          success: false,
          error: 'Máximo 20 subcategorías permitidas'
        });
        return;
      }

      categoria.subcategorias = subcategorias.filter(s => 
        typeof s === 'string' && s.trim().length > 0
      ).map(s => s.trim());
    }

    await categoria.save();

    res.status(200).json({
      success: true,
      data: {
        _id: categoria._id.toString(),
        userId: categoria.userId.toString(),
        nombre: categoria.nombre,
        tipo: categoria.tipo,
        subcategorias: categoria.subcategorias || [],
        createdAt: categoria.createdAt.toISOString()
      },
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({
        success: false,
        error: 'Ya existe una categoría con ese nombre'
      });
      return;
    }
    res.status(500).json({
      success: false,
      error: 'Error al actualizar categoría'
    });
  }
};

// Eliminar una categoría
export const deleteCategoria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const { id } = req.params;

    const categoria = await Categoria.findOneAndDelete({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!categoria) {
      res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar categoría'
    });
  }
};

