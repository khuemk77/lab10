import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Sequelize, DataTypes } from 'sequelize';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Setup DB connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false }
    }
});

// Test DB connection
sequelize.authenticate()
    .then(() => console.log('Database connected!'))
    .catch(err => console.log('Error: ', err));

// Define Puppy model
const Puppy = sequelize.define('puppies', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    breed: { type: DataTypes.STRING(100), allowNull: true },
    weight_lbs: { type: DataTypes.DECIMAL(5,2), allowNull: true },
    arrival_date: { type: DataTypes.DATE, allowNull: true, defaultValue: Sequelize.NOW },
    vaccinated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'puppies', timestamps: false, underscored: true });

// Routes

// GET all puppies
app.get('/puppies', async (req, res) => {
    try {
        const puppies = await Puppy.findAll();
        res.json(puppies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET puppy by ID
app.get('/puppies/:id', async (req, res) => {
    const puppy = await Puppy.findByPk(req.params.id);
    res.json(puppy);
});

// POST new puppy
app.post('/puppies', async (req, res) => {
  try {
    const { name, breed, weight_lbs, vaccinated } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newPuppy = await Puppy.create({ name, breed, weight_lbs, vaccinated });
    res.status(201).json(newPuppy);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add puppy' });
  }
});


// PUT update puppy
app.put('/puppies/:id', async (req, res) => {
    await Puppy.update(req.body, { where: { id: req.params.id } });
    const updatedPuppy = await Puppy.findByPk(req.params.id);
    res.json(updatedPuppy);
});

// DELETE puppy
app.delete('/puppies/:id', async (req, res) => {
    await Puppy.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Puppy deleted' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
