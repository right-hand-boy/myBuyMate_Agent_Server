const Agent = require("../models/Agent");

// Get user profile by ID
exports.getAgentProfile = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateAgentProfile = async (req, res) => {
  try {
    const updatedAgent = await Agent.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedAgent) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(updatedAgent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all users (for admin/merchant)
exports.getAllAgents = async (req, res) => {
  try {
    const agents = await Agent.find();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
