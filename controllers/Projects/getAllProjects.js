const schemas = require("../../mongodb/schemas/schemas");

const getAllProjects = async (req, res) => {
    try {
        // Build the aggregation pipeline
        let pipeline = [
            {
                // Exclude projects with a status of "completed"
                $match: {
                    status: { $ne: "Completed" }
                }
            },
            {
                // Add a field that represents the custom sort order based on priority
                $addFields: {
                    sortPriority: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$priority", "Urgent"] }, then: 1 },
                                { case: { $eq: ["$priority", "High"] }, then: 2 },

                                { case: { $eq: ["$priority", "Medium"] }, then: 3 },
                                { case: { $eq: ["$priority", "Low"] }, then: 4 }
                            ],
                            default: 0 // Default case, replace with appropriate value or action

                        }
                    }
                }
            },
            {
                $sort: { sortPriority: 1 }
            },
            {
                $project: { sortPriority: 0 }
            }
        ];

        const projects = await schemas.Project.aggregate(pipeline);
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = getAllProjects;
