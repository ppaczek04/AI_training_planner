import express from 'express'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = 3000
const SURVEYS_FILE = path.join(__dirname, 'surveys.json')

app.use(express.json())

// Load existing surveys from file
async function loadSurveys() {
  try {
    const data = await fs.readFile(SURVEYS_FILE, 'utf-8')
    // Handle empty file
    if (!data || data.trim() === '') {
      return { surveys: [] }
    }
    return JSON.parse(data)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return { surveys: [] }
    }
    throw error
  }
}

// Save surveys to file
async function saveSurveys(surveys) {
  await fs.writeFile(SURVEYS_FILE, JSON.stringify(surveys, null, 2), 'utf-8')
}

// API endpoint to save survey
app.post('/api/save-survey', async (req, res) => {
  try {
    const { daysPerWeek, weight, sex, height, age, experienceLevel, availableEquipment, timestamp } = req.body

    // Validate input
    if (!daysPerWeek || !weight || !sex || !height || !age || !experienceLevel) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate experience level
    if (!['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) {
      return res.status(400).json({ error: 'Invalid experience level' })
    }

    // Validate days per week
    if (daysPerWeek < 1 || daysPerWeek > 7) {
      return res.status(400).json({ error: 'Days per week must be between 1 and 7' })
    }

    // Load existing surveys
    const data = await loadSurveys()

    // Add new survey
    const newSurvey = {
      id: Date.now(),
      daysPerWeek,
      weight,
      sex,
      height,
      age,
      experienceLevel,
      availableEquipment: availableEquipment || [],
      timestamp: timestamp || new Date().toISOString()
    }

    data.surveys.push(newSurvey)

    // Save updated surveys
    await saveSurveys(data)

    res.json({ message: 'Survey saved successfully', survey: newSurvey })
  } catch (error) {
    console.error('Error saving survey:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// API endpoint to get all surveys
app.get('/api/surveys', async (req, res) => {
  try {
    const data = await loadSurveys()
    res.json(data)
  } catch (error) {
    console.error('Error loading surveys:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Surveys will be saved to: ${SURVEYS_FILE}`)
})
