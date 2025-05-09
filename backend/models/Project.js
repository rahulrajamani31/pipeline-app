const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    unique: true,
  },
  pipelines: {
    type: Map,
    of: String, // pipelineName: url
    default: {},
  },
});

module.exports = mongoose.model('Project', projectSchema);
