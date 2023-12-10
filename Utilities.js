const Utilities = {
    unwantedPatterns: [],
    forbiddenTexts: [
        "AnimSequencer::EnqueueAnimJobForStopping",
        "AnimSequencer::EnqueueAnimJob((null))",
        "dropping anim job",
        "_idle_",
        "[FMOD_COREAUDIO INFO]"
    ],

    shouldFilterOut(data) {
        for (const pattern of this.unwantedPatterns) {
            if (pattern.test(data)) {
                return true;
            }
        }
        return false;
    },

    isLogMessageAllowed(message) {
        return !this.forbiddenTexts.some(forbiddenText => message.includes(forbiddenText));
    }
};

module.exports = Utilities;
