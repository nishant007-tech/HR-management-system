const Employee = require('../models/employeeModel');

// GET /api/employees/metadata
// returns the unique positions and departments for dropdowns
const getMetadata = async (req, res) => {
  try {
    const positions = await Employee.distinct('position');
    const departments = await Employee.distinct('department');
    return res.json({ positions, departments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employees
// query params: page, limit, position, search
const getEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      position,
      search
    } = req.query;

    const filter = {};
    if (position)    filter.position = position;
    if (search)      filter.name = new RegExp(search, 'i');

    const skip = (page - 1) * limit;
    const [ results, count ] = await Promise.all([
      Employee.find(filter)
        .sort({ joiningDate: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Employee.countDocuments(filter)
    ]);

    return res.json({ results, count });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/employees/:id
const getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Not found' });
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const emp = await Employee.create(req.body);
    return res.status(201).json(emp);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!emp) return res.status(404).json({ message: 'Not found' });
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
};

const updateEmployeeStatus = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!emp) return res.status(404).json({ message: 'Not found' });
    return res.json(emp);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message });
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Not found' });
    return res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMetadata,
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee
};