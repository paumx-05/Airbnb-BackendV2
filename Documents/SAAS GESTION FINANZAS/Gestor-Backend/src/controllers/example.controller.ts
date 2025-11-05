import { Request, Response } from 'express';
import { Example } from '../models/example.model';

export const getExamples = async (_req: Request, res: Response): Promise<void> => {
  try {
    const examples = await Example.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: examples,
      count: examples.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener ejemplos'
    });
  }
};

export const getExampleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const example = await Example.findById(id);

    if (!example) {
      res.status(404).json({
        success: false,
        error: 'Ejemplo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: example
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al obtener el ejemplo'
    });
  }
};

export const createExample = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const example = new Example({ name, description });
    const savedExample = await example.save();

    res.status(201).json({
      success: true,
      data: savedExample,
      message: 'Ejemplo creado exitosamente'
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: Object.values(error.errors).map((err: any) => err.message).join(', ')
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al crear el ejemplo'
    });
  }
};

export const updateExample = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const example = await Example.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!example) {
      res.status(404).json({
        success: false,
        error: 'Ejemplo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: example,
      message: 'Ejemplo actualizado exitosamente'
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: Object.values(error.errors).map((err: any) => err.message).join(', ')
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Error al actualizar el ejemplo'
    });
  }
};

export const deleteExample = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const example = await Example.findByIdAndDelete(id);

    if (!example) {
      res.status(404).json({
        success: false,
        error: 'Ejemplo no encontrado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Ejemplo eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el ejemplo'
    });
  }
};

