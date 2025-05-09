const express = require('express');
const Project = require('../models/Project');
const router = express.Router();


/************GET ROUTE ***********/

//Gets - All the Project names
router.get("/api/projects", async (req, res) => {
  try {
    const projects = await Project.find({}, 'projectName'); 
    const projectNames = projects.map((project) => project.projectName);

    return res.json({ projects: projectNames });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch projects", error: err.message });
  }
});

//Gets - the list of pipelines and and the respective urls of the project
router.get("/api/pipelines/:projectName", async (req, res) => {
  const { projectName } = req.params;

  try {
    const project = await Project.findOne({ projectName });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ pipelines: project.pipelines });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch pipelines", error: err.message });
  }
});

router.get("/api/pipeline-url", async (req, res) => {
  const { projectName, pipelineName } = req.query;

  if (!projectName || !pipelineName) {
    return res.status(400).json({ message: "Both projectName and pipelineName are required" });
  }

  try {
    const project = await Project.findOne({ projectName });

    if (!project || !project.pipelines.has(pipelineName)) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    return res.json({ pipelineUrl: project.pipelines.get(pipelineName) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch pipeline URL", error: err.message });
  }
});


router.get("/api/all-pipelines", async (req, res) => {
  try {
    const projects = await Project.find({});
    const pipelines = [];

    projects.forEach(project => {
      const projectName = project.projectName;
      for (const [pipelineName, url] of project.pipelines.entries()) {
        pipelines.push({ projectName, pipelineName, url });
        console.log(projectName+pipelineName+url)
      }
    });

    res.json({ pipelines });
  } catch (err) {
    res.status(500).json({ message: "Error fetching pipelines", error: err.message });
  }
});

/********POST ROUTE***********/
router.post("/api/pipelines", async (req, res) => {
  const { projectName, pipelineName, pipelineUrl } = req.body;

  if (!projectName || !pipelineName || !pipelineUrl) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    let project = await Project.findOne({ projectName });

    if (!project) {
      project = new Project({
        projectName,
        pipelines: { [pipelineName]: pipelineUrl },
      });
    } else {
      project.pipelines.set(pipelineName, pipelineUrl);
    }
    await project.save();

    return res.status(201).json({
      message: "Pipeline URL added/updated successfully",
      data: project.pipelines,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to save pipeline", error: err.message });
  }
});

/**************PUT ROUTES ***************/
router.put("/api/pipelines", async (req, res) => {
  const { projectName, pipelineName, pipelineUrl } = req.body;

  if (!projectName || !pipelineName || !pipelineUrl) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const project = await Project.findOne({ projectName });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    project.pipelines.set(pipelineName, pipelineUrl);
    await project.save();

    return res.status(200).json({ message: "Pipeline updated successfully", data: project.pipelines });
  } catch (err) {
    res.status(500).json({ message: "Failed to update pipeline", error: err.message });
  }
});


//**********DELETE ROUTES********************/
router.delete("/api/pipelines", async (req, res) => {
  const { projectName, pipelineName } = req.body;

  if (!projectName || !pipelineName) {
    return res.status(400).json({ message: "Project name and pipeline name are required" });
  }

  try {
    const project = await Project.findOne({ projectName });

    if (!project || !project.pipelines.has(pipelineName)) {
      return res.status(404).json({ message: "Pipeline not found" });
    }

    project.pipelines.delete(pipelineName);
    await project.save();

    return res.status(200).json({ message: "Pipeline deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete pipeline", error: err.message });
  }
});

module.exports = router;
