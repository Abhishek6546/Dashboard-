import Data from '../models/Data.js';

export const getAllData = async (req, res) => {
  try {
    const data = await Data.find({});
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching data', error: err });
  }
};