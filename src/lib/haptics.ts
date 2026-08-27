/**
 * CampusLoop Haptic Feedback Engine
 * Triggers native vibration patterns on mobile devices for tactile physical feedback.
 */

class HapticsEngine {
  private canVibrate(): boolean {
    return typeof window !== "undefined" && typeof navigator.vibrate === "function";
  }

  /**
   * Ultra-light tap (for tabs, navigation, filter pills)
   */
  public light() {
    if (this.canVibrate()) {
      navigator.vibrate(10);
    }
  }

  /**
   * Standard medium pulse (for heart like toggle)
   */
  public medium() {
    if (this.canVibrate()) {
      navigator.vibrate(25);
    }
  }

  /**
   * Heartbeat rhythm (for double-tap heart pop)
   */
  public heartbeat() {
    if (this.canVibrate()) {
      navigator.vibrate([15, 50, 20]);
    }
  }

  /**
   * Signature multi-phase pulse for Reposts
   */
  public repost() {
    if (this.canVibrate()) {
      navigator.vibrate([20, 35, 30, 45, 25]);
    }
  }

  /**
   * Success notification pulse (message sent, link copied)
   */
  public success() {
    if (this.canVibrate()) {
      navigator.vibrate([25, 40, 25]);
    }
  }

  /**
   * Celebratory multi-burst (for matches and crush unlocks)
   */
  public match() {
    if (this.canVibrate()) {
      navigator.vibrate([40, 60, 40, 80, 50]);
    }
  }

  /**
   * Heavy alert pulse (delete post, error warning)
   */
  public heavy() {
    if (this.canVibrate()) {
      navigator.vibrate(55);
    }
  }
}

export const haptics = new HapticsEngine();
