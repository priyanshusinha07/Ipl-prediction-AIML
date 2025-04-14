document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const themeSwitch = document.getElementById("theme-switch")
    const battingTeamSelect = document.getElementById("batting-team")
    const bowlingTeamSelect = document.getElementById("bowling-team")
    const citySelect = document.getElementById("city")
    const targetInput = document.getElementById("target")
    const scoreInput = document.getElementById("score")
    const oversInput = document.getElementById("overs")
    const wicketsInput = document.getElementById("wickets")
    const calculateStatsBtn = document.getElementById("calculate-stats")
    const predictBtn = document.getElementById("predict-btn")
    const calculatedStatsSection = document.getElementById("calculated-stats")
    const runsRequiredElement = document.getElementById("runs-required")
    const ballsRemainingElement = document.getElementById("balls-remaining")
    const currentRRElement = document.getElementById("current-rr")
    const requiredRRElement = document.getElementById("required-rr")
    const resultModal = document.getElementById("result-modal")
    const closeModal = document.querySelector(".close-modal")
    const battingMeter = document.getElementById("batting-meter")
    const bowlingMeter = document.getElementById("bowling-meter")
    const battingPercentage = document.getElementById("batting-percentage")
    const bowlingPercentage = document.getElementById("bowling-percentage")
    const matchSituation = document.getElementById("match-situation")
    const keyFactor = document.getElementById("key-factor")
    const predictionSummary = document.getElementById("prediction-summary")
    const loadingOverlay = document.getElementById("loading-overlay")
    const errorToast = document.getElementById("error-toast")
    const errorMessage = document.querySelector(".error-message")
    const errorClose = document.querySelector(".error-close")
    const battingTeamLogo = document.getElementById("batting-team-logo").querySelector("img")
    const bowlingTeamLogo = document.getElementById("bowling-team-logo").querySelector("img")
    const resultBattingLogo = document.getElementById("result-batting-logo")
    const resultBowlingLogo = document.getElementById("result-bowling-logo")
  
    // API Configuration
    const API_URL = "http://localhost:5000/predict"
    const API_TIMEOUT = 15000 // 15 seconds timeout
    const MAX_RETRIES = 2
  
    // Teams and cities data
    const teams = [
      "Sunrisers Hyderabad",
      "Mumbai Indians",
      "Royal Challengers Bangalore",
      "Kolkata Knight Riders",
      "Kings XI Punjab",
      "Chennai Super Kings",
      "Rajasthan Royals",
      "Delhi Capitals",
    ]
  
    const cities = [
      "Hyderabad",
      "Bangalore",
      "Mumbai",
      "Indore",
      "Kolkata",
      "Delhi",
      "Chandigarh",
      "Jaipur",
      "Chennai",
      "Cape Town",
      "Port Elizabeth",
      "Durban",
      "Centurion",
      "East London",
      "Johannesburg",
      "Kimberley",
      "Bloemfontein",
      "Ahmedabad",
      "Cuttack",
      "Nagpur",
      "Dharamsala",
      "Visakhapatnam",
      "Pune",
      "Raipur",
      "Ranchi",
      "Abu Dhabi",
      "Sharjah",
      "Mohali",
      "Bengaluru",
    ]
  
    // Team logos mapping
    const teamLogos = {
      "Mumbai Indians": "images/Mumbai.png",
      "Chennai Super Kings": "images/Cheenai.png",
      "Royal Challengers Bangalore": "images/Banglore.png",
      "Kolkata Knight Riders": "images/Kolkata.jpg",
      "Sunrisers Hyderabad": "images/Hyderabad.png",
      "Delhi Capitals": "images/Delhi.jpg",
      "Kings XI Punjab": "images/Punjab.jpg",
      "Rajasthan Royals": "images/Rajasthan.jpg",
    }
  
    // Theme toggle functionality
    themeSwitch.addEventListener("change", function () {
      if (this.checked) {
        document.documentElement.setAttribute("data-theme", "dark")
        localStorage.setItem("theme", "dark")
      } else {
        document.documentElement.setAttribute("data-theme", "light")
        localStorage.setItem("theme", "light")
      }
    })
  
    // Check for saved theme preference
    const currentTheme = localStorage.getItem("theme") || "light"
    if (currentTheme === "dark") {
      themeSwitch.checked = true
      document.documentElement.setAttribute("data-theme", "dark")
    }
  
    // Populate dropdowns
    teams.sort().forEach((team) => {
      battingTeamSelect.innerHTML += `<option value="${team}">${team}</option>`
      bowlingTeamSelect.innerHTML += `<option value="${team}">${team}</option>`
    })
  
    cities.sort().forEach((city) => {
      citySelect.innerHTML += `<option value="${city}">${city}</option>`
    })
  
    // Update team logos when selection changes
    battingTeamSelect.addEventListener("change", function () {
      const selectedTeam = this.value
      if (selectedTeam && teamLogos[selectedTeam]) {
        battingTeamLogo.src = teamLogos[selectedTeam]
        battingTeamLogo.alt = selectedTeam
      } else {
        battingTeamLogo.src = "images/Batting.jpeg"
        battingTeamLogo.alt = "Select Batting Team"
      }
  
      // Prevent same team selection
      if (selectedTeam && selectedTeam === bowlingTeamSelect.value) {
        showError("Batting and bowling teams cannot be the same")
        this.value = ""
        battingTeamLogo.src = "images/Batting.jpeg"
        battingTeamLogo.alt = "Select Batting Team"
      }
    })
  
    bowlingTeamSelect.addEventListener("change", function () {
      const selectedTeam = this.value
      if (selectedTeam && teamLogos[selectedTeam]) {
        bowlingTeamLogo.src = teamLogos[selectedTeam]
        bowlingTeamLogo.alt = selectedTeam
      } else {
        bowlingTeamLogo.src = "images/Bowling.jpg"
        bowlingTeamLogo.alt = "Select Bowling Team"
      }
  
      // Prevent same team selection
      if (selectedTeam && selectedTeam === battingTeamSelect.value) {
        showError("Batting and bowling teams cannot be the same")
        this.value = ""
        bowlingTeamLogo.src = "images/Bowling.jpg"
        bowlingTeamLogo.alt = "Select Bowling Team"
      }
    })
  
    // Calculate stats button functionality
    calculateStatsBtn.addEventListener("click", () => {
      // Validate inputs
      if (!validateInputs()) {
        return
      }
  
      // Get values
      const target = Number.parseFloat(targetInput.value)
      const score = Number.parseFloat(scoreInput.value)
      const overs = Number.parseFloat(oversInput.value)
      const wickets = Number.parseInt(wicketsInput.value)
  
      // Calculate stats
      const runsLeft = target - score
      const ballsLeft = 120 - overs * 6
      const crr = overs > 0 ? (score / overs).toFixed(2) : "0.00"
      const rrr = ballsLeft > 0 ? ((runsLeft * 6) / ballsLeft).toFixed(2) : "N/A"
  
      // Update UI
      runsRequiredElement.textContent = runsLeft
      ballsRemainingElement.textContent = ballsLeft
      currentRRElement.textContent = crr
      requiredRRElement.textContent = rrr
  
      // Show stats section with animation
      calculatedStatsSection.style.display = "block"
      calculatedStatsSection.classList.add("fade-in")
  
      // Scroll to stats section
      calculatedStatsSection.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
  
    // Input validation functions
    function validateInputs() {
      // Check if all fields are filled
      if (
        !battingTeamSelect.value ||
        !bowlingTeamSelect.value ||
        !citySelect.value ||
        !targetInput.value ||
        !scoreInput.value ||
        !oversInput.value ||
        !wicketsInput.value
      ) {
        showError("Please fill in all fields")
        return false
      }
  
      // Check if teams are different
      if (battingTeamSelect.value === bowlingTeamSelect.value) {
        showError("Batting team and bowling team cannot be the same")
        return false
      }
  
      // Parse numeric values
      const target = Number.parseFloat(targetInput.value)
      const score = Number.parseFloat(scoreInput.value)
      const overs = Number.parseFloat(oversInput.value)
      const wickets = Number.parseInt(wicketsInput.value)
  
      // Validate target
      if (isNaN(target) || target <= 0) {
        showError("Target must be a positive number")
        return false
      }
  
      // Validate score
      if (isNaN(score) || score < 0) {
        showError("Score must be a non-negative number")
        return false
      }
  
      if (score > target) {
        showError("Current score cannot be greater than target")
        return false
      }
  
      // Validate overs
      if (isNaN(overs) || overs < 0 || overs > 20) {
        showError("Overs must be between 0 and 20")
        return false
      }
  
      // Validate wickets
      if (isNaN(wickets) || wickets < 0 || wickets > 10) {
        showError("Wickets must be between 0 and 10")
        return false
      }
  
      return true
    }
  
    // Function to make API request with timeout and retry
    async function fetchWithTimeout(url, options, timeout, retries = 0) {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
  
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })
  
        clearTimeout(timeoutId)
  
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Server error (${response.status}): ${errorText || "Unknown error"}`)
        }
  
        return response
      } catch (error) {
        clearTimeout(timeoutId)
  
        if (error.name === "AbortError") {
          throw new Error("Request timed out. The server took too long to respond.")
        }
  
        if (retries > 0 && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError"))) {
          console.log(`Retrying request (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`)
          return fetchWithTimeout(url, options, timeout, retries - 1)
        }
  
        throw error
      }
    }
  
    // Handle form submission
    predictBtn.addEventListener("click", async () => {
      // Validate inputs
      if (!validateInputs()) {
        return
      }
  
      // Get values
      const battingTeam = battingTeamSelect.value
      const bowlingTeam = bowlingTeamSelect.value
      const city = citySelect.value
      const target = Number.parseFloat(targetInput.value)
      const score = Number.parseFloat(scoreInput.value)
      const overs = Number.parseFloat(oversInput.value)
      const wickets = Number.parseInt(wicketsInput.value)
  
      // Show loading overlay
      loadingOverlay.style.display = "flex"
  
      try {
        console.log("Sending prediction request to Python backend...")
  
        // Prepare data for API
        const requestData = {
          batting_team: battingTeam,
          bowling_team: bowlingTeam,
          city: city,
          target: target,
          score: score,
          overs: overs,
          wickets: wickets,
        }
  
        // Send data to backend with timeout and retry
        const response = await fetchWithTimeout(
          API_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          },
          API_TIMEOUT,
          MAX_RETRIES,
        )
  
        const data = await response.json()
        console.log("Received prediction response:", data)
  
        if (data.error) {
          throw new Error(`Prediction error: ${data.error}`)
        }
  
        // Extract prediction results
        const battingWinProb = data.batting_team_win_probability
        const bowlingWinProb = data.bowling_team_win_probability
  
        // Update result modal
        document.getElementById("batting-team-result").querySelector(".team-name").textContent = battingTeam
        document.getElementById("bowling-team-result").querySelector(".team-name").textContent = bowlingTeam
  
        // Update team logos in result
        resultBattingLogo.src = teamLogos[battingTeam] || "images/Batting.jpeg"
        resultBowlingLogo.src = teamLogos[bowlingTeam] || "images/Bowling.jpg"
  
        // Animate prediction meter
        battingMeter.style.width = `${battingWinProb}%`
        bowlingMeter.style.width = `${bowlingWinProb}%`
        battingPercentage.textContent = `${Math.round(battingWinProb)}%`
        bowlingPercentage.textContent = `${Math.round(bowlingWinProb)}%`
  
        // Set match situation text
        if (battingWinProb > 75) {
          matchSituation.textContent = `${battingTeam} heavily favored`
          keyFactor.textContent = "Strong batting position"
        } else if (battingWinProb > 60) {
          matchSituation.textContent = `${battingTeam} slightly ahead`
          keyFactor.textContent = "Manageable required run rate"
        } else if (battingWinProb > 40) {
          matchSituation.textContent = "Evenly matched"
          keyFactor.textContent = "Could go either way"
        } else if (battingWinProb > 25) {
          matchSituation.textContent = `${bowlingTeam} slightly ahead`
          keyFactor.textContent = "Rising required run rate"
        } else {
          matchSituation.textContent = `${bowlingTeam} heavily favored`
          keyFactor.textContent = "Difficult chase ahead"
        }
  
        // Calculate derived values for summary
        const runsLeft = target - score
        const ballsLeft = 120 - overs * 6
        const wicketsLeft = 10 - wickets
        const rrr = ballsLeft > 0 ? (runsLeft * 6) / ballsLeft : Number.POSITIVE_INFINITY
  
        // Set prediction summary
        predictionSummary.textContent = generatePredictionSummary(
          battingTeam,
          bowlingTeam,
          battingWinProb,
          runsLeft,
          ballsLeft,
          wicketsLeft,
          rrr,
        )
  
        // Show modal
        resultModal.classList.add("show")
      } catch (error) {
        console.error("Prediction error:", error)
  
        // Handle different types of errors
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          showError(
            "Cannot connect to the prediction server. Please check if the Python backend is running at " + API_URL,
          )
        } else if (error.message.includes("timed out")) {
          showError("The prediction request timed out. Please try again later.")
        } else {
          showError(error.message || "An error occurred while making the prediction")
        }
      } finally {
        // Hide loading overlay
        loadingOverlay.style.display = "none"
      }
    })
  
    // Close modal functionality
    closeModal.addEventListener("click", () => {
      resultModal.classList.remove("show")
    })
  
    // Close modal when clicking outside
    window.addEventListener("click", (event) => {
      if (event.target === resultModal) {
        resultModal.classList.remove("show")
      }
    })
  
    // Close error toast
    errorClose.addEventListener("click", () => {
      errorToast.classList.remove("show")
    })
  
    function showError(message) {
      errorMessage.textContent = message
      errorToast.classList.add("show")
  
      // Auto hide after 5 seconds
      setTimeout(() => {
        errorToast.classList.remove("show")
      }, 5000)
    }
  
    // Generate prediction summary
    function generatePredictionSummary(battingTeam, bowlingTeam, battingWinProb, runsLeft, ballsLeft, wicketsLeft, rrr) {
      if (runsLeft <= 0) {
        return `${battingTeam} has already achieved the target and won the match.`
      }
  
      if (wicketsLeft === 0) {
        return `${bowlingTeam} has won the match by bowling out ${battingTeam}.`
      }
  
      if (battingWinProb > 75) {
        return `${battingTeam} is in a commanding position with ${wicketsLeft} wickets in hand and needing ${runsLeft} runs from ${ballsLeft} balls. The required run rate of ${rrr.toFixed(2)} appears manageable given their strong batting lineup.`
      } else if (battingWinProb > 60) {
        return `${battingTeam} has a slight edge in this match, needing ${runsLeft} runs from ${ballsLeft} balls with ${wicketsLeft} wickets remaining. The required run rate of ${rrr.toFixed(2)} is challenging but achievable.`
      } else if (battingWinProb > 40) {
        return `This match is evenly poised with ${battingTeam} needing ${runsLeft} runs from ${ballsLeft} balls with ${wicketsLeft} wickets in hand. The required run rate of ${rrr.toFixed(2)} makes for an exciting finish.`
      } else if (battingWinProb > 25) {
        return `${bowlingTeam} has a slight advantage as ${battingTeam} needs ${runsLeft} runs from ${ballsLeft} balls with ${wicketsLeft} wickets remaining. The required run rate of ${rrr.toFixed(2)} is mounting pressure on the batting side.`
      } else {
        return `${bowlingTeam} is in a dominant position with ${battingTeam} struggling to chase ${runsLeft} runs from ${ballsLeft} balls with only ${wicketsLeft} wickets in hand. The required run rate of ${rrr.toFixed(2)} appears too steep at this stage.`
      }
    }
  
    // Add input event listeners for real-time validation
    targetInput.addEventListener("input", function () {
      if (Number.parseFloat(this.value) <= 0) {
        this.classList.add("error")
      } else {
        this.classList.remove("error")
      }
    })
  
    scoreInput.addEventListener("input", function () {
      const target = Number.parseFloat(targetInput.value)
      if (Number.parseFloat(this.value) > target) {
        this.classList.add("error")
      } else {
        this.classList.remove("error")
      }
    })
  
    oversInput.addEventListener("input", function () {
      const value = Number.parseFloat(this.value)
      if (value < 0 || value > 20) {
        this.classList.add("error")
      } else {
        this.classList.remove("error")
      }
    })
  
    wicketsInput.addEventListener("input", function () {
      const value = Number.parseInt(this.value)
      if (value < 0 || value > 10) {
        this.classList.add("error")
      } else {
        this.classList.remove("error")
      }
    })
  
    // Add animation classes to elements on page load
    document.querySelectorAll(".team-card, .match-details-container, .status-container").forEach((element) => {
      element.classList.add("slide-in")
    })
  
    // Check if Python backend is available on page load
    async function checkBackendConnection() {
      try {
        const response = await fetch(API_URL.replace("/predict", "/"), {
          method: "HEAD",
          timeout: 2000,
        })
        console.log("Backend connection check:", response.ok ? "Success" : "Failed")
  
        if (!response.ok) {
          showError("Warning: Python backend server may not be running correctly. Predictions may not work.")
        }
      } catch (error) {
        console.warn("Backend connection check failed:", error.message)
        showError("Warning: Cannot connect to the Python backend. Please ensure the server is running at " + API_URL)
      }
    }
  
    // Uncomment to check backend connection on page load
    // checkBackendConnection()
    checkBackendConnection()
  })
  