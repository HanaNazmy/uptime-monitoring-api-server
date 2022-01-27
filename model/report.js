const mongoose = require('mongoose')

const ReportSchema = new mongoose.Schema(
	{
        name: { type: String, required: true, unique: true, ref: 'Check'},
        username: { type: String, required: true, ref: 'User'},
		status: { type: String, required: true},
		availability: { type: Number, required: true},
        outages:{ type: Number, required: true },
        downtime:{ type: Number, required: true },
        uptime:{ type: Number, required: true },
        responseTime:{ type: Number, required: true },
        history:{ type: [String], required: true },
	},
	{ collection: 'reports' }
)

const reportModel = mongoose.model('ReportSchema', ReportSchema)

module.exports = reportModel

// status - The current status of the URL.
// availability - A percentage of the URL availability.
// outages - The total number of URL downtimes.
// downtime - The total time, in seconds, of the URL downtime.
// uptime - The total time, in seconds, of the URL uptime.
// responseTime - The average response time for the URL.
// history - Timestamped logs of the polling requests.