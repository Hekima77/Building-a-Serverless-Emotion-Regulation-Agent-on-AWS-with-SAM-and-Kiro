# Emotion Regulation Agent - PowerShell Demo
# Pure PowerShell implementation - no external dependencies

# ============================================================================
# STRESS DETECTOR CLASS
# ============================================================================

class StressDetector {
    [hashtable]$keywords = @{
        anxiety = @('anxious', 'anxiety', 'nervous', 'worried', 'uneasy', 'jittery', 'panicked')
        stress = @('stressed', 'stress', 'overwhelming', 'overwhelmed', 'pressured', 'burdened')
        sadness = @('sad', 'depressed', 'blue', 'gloomy', 'miserable', 'unhappy')
        anger = @('angry', 'furious', 'rage', 'irritated', 'frustrated', 'mad')
        overwhelm = @('overwhelmed', 'drowning', 'swamped', 'buried', 'suffocated', 'trapped')
    }

    [hashtable] DetectStress([string]$text) {
        if ([string]::IsNullOrWhiteSpace($text)) {
            return @{
                isStressed = $false
                confidence = 0
                detectedEmotions = @()
                rawText = $text
            }
        }

        $normalizedText = $text.ToLower()
        $detectedEmotions = [System.Collections.ArrayList]@()
        $matchCount = 0

        foreach ($emotion in $this.keywords.Keys) {
            $keywords = $this.keywords[$emotion]
            foreach ($keyword in $keywords) {
                $pattern = "\b$keyword\b"
                $matches = [regex]::Matches($normalizedText, $pattern, 'IgnoreCase')
                if ($matches.Count -gt 0) {
                    $matchCount += $matches.Count
                    if ($detectedEmotions -notcontains $emotion) {
                        $detectedEmotions.Add($emotion) | Out-Null
                    }
                }
            }
        }

        $confidence = [math]::Min($matchCount / 3, 1.0)
        $isStressed = $confidence -gt 0.2

        return @{
            isStressed = $isStressed
            confidence = $confidence
            detectedEmotions = $detectedEmotions
            rawText = $text
        }
    }

    [string] GetEmotionMessage([System.Collections.ArrayList]$detectedEmotions) {
        if ($detectedEmotions.Count -eq 0) {
            return "You seem calm right now."
        }

        $descriptions = @{
            anxiety = "I sense some anxiety"
            stress = "I detect stress"
            sadness = "I sense sadness"
            anger = "I notice some anger"
            overwhelm = "You seem overwhelmed"
        }

        $msgs = @()
        foreach ($emotion in $detectedEmotions) {
            $msgs += $descriptions[$emotion]
        }

        $combined = $msgs -join ", "
        return "$combined. Let's take a moment to breathe and calm down."
    }
}

# ============================================================================
# BREATHING ROUTINE GENERATOR CLASS
# ============================================================================

class BreathingRoutineGenerator {
    [hashtable] GenerateRoutine() {
        $cycles = 5
        $pattern = @{ inhale = 4; hold = 4; exhale = 6 }
        $totalDuration = $cycles * ($pattern.inhale + $pattern.hold + $pattern.exhale)

        $instructions = $this.BuildInstructions($cycles, $pattern)

        return @{
            instructions = $instructions
            duration = $totalDuration
            cycles = $cycles
            pattern = $pattern
        }
    }

    [string] BuildInstructions([int]$cycles, [hashtable]$pattern) {
        $cycleTime = $pattern.inhale + $pattern.hold + $pattern.exhale
        $totalTime = $cycles * $cycleTime

        $txt = "GUIDED BREATHING EXERCISE ($cycles cycles, ${totalTime}s total)`n"
        $txt += "Pattern: Inhale for $($pattern.inhale)s → Hold for $($pattern.hold)s → Exhale for $($pattern.exhale)s`n"
        $txt += "---`n`n"

        for ($i = 1; $i -le $cycles; $i++) {
            $txt += "CYCLE $($i):`n"
            $txt += "1. INHALE - Breathe in slowly through your nose for $($pattern.inhale) seconds`n"
            $txt += "2. HOLD - Keep the air in your lungs for $($pattern.hold) seconds`n"
            $txt += "3. EXHALE - Release the air slowly through your mouth for $($pattern.exhale) seconds`n"
            if ($i -lt $cycles) { $txt += "`n" }
        }

        $txt += "`n---`n"
        $txt += "Tips:`n"
        $txt += "• Breathe naturally, no forcing`n"
        $txt += "• Focus on your breath`n"
        $txt += "• Close your eyes if it helps you relax`n"

        return $txt
    }
}

# ============================================================================
# EMOTION AGENT CLASS
# ============================================================================

class EmotionAgent {
    [StressDetector]$detector
    [BreathingRoutineGenerator]$generator
    [System.Collections.ArrayList]$interactions

    EmotionAgent() {
        $this.detector = [StressDetector]::new()
        $this.generator = [BreathingRoutineGenerator]::new()
        $this.interactions = [System.Collections.ArrayList]@()
    }

    [hashtable] ProcessUserInput([string]$userInput, [string]$userId) {
        $interactionId = [guid]::NewGuid().ToString()
        $timestamp = [int64]([datetime]::UtcNow - [datetime]'1970-01-01').TotalMilliseconds

        # Detect stress
        $stressDetection = $this.detector.DetectStress($userInput)
        $emotionMessage = $this.detector.GetEmotionMessage($stressDetection.detectedEmotions)

        # Generate routine if stressed
        $routine = $null
        $responseMessage = $emotionMessage

        if ($stressDetection.isStressed) {
            $routine = $this.generator.GenerateRoutine()
            $responseMessage += "`n`n$($routine.instructions)"
        }
        else {
            $responseMessage += "`n`nNo breathing exercise needed right now."
        }

        # Log interaction
        $log = @{
            interactionId = $interactionId
            timestamp = $timestamp
            userId = $userId
            userInput = $userInput
            detectedEmotions = $stressDetection.detectedEmotions
            isStressed = $stressDetection.isStressed
            confidence = $stressDetection.confidence
        }

        $this.interactions.Add($log) | Out-Null

        return @{
            interactionId = $interactionId
            message = $responseMessage
            stressDetection = $stressDetection
            routine = $routine
            timestamp = $timestamp
        }
    }

    [System.Collections.ArrayList] GetUserHistory([string]$userId) {
        $result = [System.Collections.ArrayList]@()
        foreach ($interaction in $this.interactions) {
            if ($interaction.userId -eq $userId) {
                $result.Add($interaction) | Out-Null
            }
        }
        return $result
    }
}

# ============================================================================
# DEMO / MAIN
# ============================================================================

Write-Host "`n🧠 Emotion Regulation Agent - Launching...`n" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Gray

$agent = [EmotionAgent]::new()

$testInputs = @(
    @{ text = "I'm feeling really anxious about my presentation"; userId = "user-1" }
    @{ text = "Everything is going great today"; userId = "user-2" }
    @{ text = "I feel overwhelmed and stressed out"; userId = "user-3" }
    @{ text = "I'm angry and frustrated with this situation"; userId = "user-1" }
)

foreach ($input in $testInputs) {
    Write-Host "`n📝 Input from $($input.userId):" -ForegroundColor Yellow
    Write-Host "   `"$($input.text)`"`n" -ForegroundColor White

    $response = $agent.ProcessUserInput($input.text, $input.userId)

    Write-Host "✅ Interaction ID: $($response.interactionId)" -ForegroundColor Green
    Write-Host "📊 Stress Detected: $($response.stressDetection.isStressed)" -ForegroundColor Cyan
    Write-Host "💯 Confidence: $([math]::Round($response.stressDetection.confidence * 100, 1))%" -ForegroundColor Magenta

    if ($response.stressDetection.detectedEmotions.Count -gt 0) {
        Write-Host "😟 Emotions: $($response.stressDetection.detectedEmotions -join ', ')" -ForegroundColor Red
    }
    else {
        Write-Host "😟 Emotions: None" -ForegroundColor Green
    }

    if ($response.routine) {
        Write-Host "`n🫁 Breathing Routine:" -ForegroundColor Cyan
        Write-Host "   - Duration: $($response.routine.duration)s" -ForegroundColor White
        Write-Host "   - Cycles: $($response.routine.cycles)" -ForegroundColor White
        Write-Host "   - Pattern: Inhale $($response.routine.pattern.inhale)s → Hold $($response.routine.pattern.hold)s → Exhale $($response.routine.pattern.exhale)s" -ForegroundColor White
    }

    Write-Host "`n$("=" * 80)" -ForegroundColor Gray
}

# Show user history
Write-Host "`n📊 USER HISTORY`n" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Gray

foreach ($userId in @("user-1", "user-2", "user-3")) {
    $history = $agent.GetUserHistory($userId)
    Write-Host "`n$userId : $($history.Count) interaction(s)" -ForegroundColor Yellow
    foreach ($log in $history) {
        $timestamp = [datetime]::UnixEpoch.AddMilliseconds($log.timestamp).ToLocalTime().ToString("HH:mm:ss")
        $preview = if ($log.userInput.Length -gt 40) { "$($log.userInput.Substring(0, 40))..." } else { $log.userInput }
        Write-Host "  - [$timestamp] `"$preview`" (Stress: $($log.isStressed))" -ForegroundColor Gray
    }
}

Write-Host "`n✨ Demo complete! The system is working.`n" -ForegroundColor Green
