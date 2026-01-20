class StrainWizard {
  currentStep: number;
  totalSteps: number;
  data: Record<string, string>;

  constructor() {
    this.currentStep = 1;
    this.totalSteps = 5;
    this.data = {};
    this.init();
  }

  init(): void {
    this.attachEventListeners();
    this.setActiveStep(1);
    this.updateStatus();
  }

  attachEventListeners(): void {
    // Next/Continue buttons
    document.querySelectorAll('[data-action="next"]').forEach((btn) => {
      btn.addEventListener("click", () => this.nextStep());
    });

    // Back buttons
    document.querySelectorAll('[data-action="back"]').forEach((btn) => {
      btn.addEventListener("click", () => this.previousStep());
    });

    // Submit button
    document
      .querySelector('[data-action="submit"]')
      ?.addEventListener("click", () => {
        this.submit();
      });

    // Option buttons (Step 2: Genetics)
    document.querySelectorAll("[data-value]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const value = (e.currentTarget as HTMLElement).dataset.value;
        if (value) {
          this.data.genetics = value;
          this.updateStatus();
          // Auto-proceed to next step after selection
          this.nextStep();
        }

        // Visual feedback
        document
          .querySelectorAll("[data-value]")
          .forEach((b) =>
            b.classList.remove(
              "border-primary-600",
              "bg-gradient-to-r",
              "from-primary-50",
              "to-secondary-50",
              "shadow-md",
            ),
          );
        (e.currentTarget as HTMLElement).classList.add(
          "border-primary-600",
          "bg-gradient-to-r",
          "from-primary-50",
          "to-secondary-50",
          "shadow-md",
        );
      });
    });

    // Number controls (+/- buttons)
    document
      .querySelectorAll('[data-action="decrease"], [data-action="increase"]')
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const action = (e.currentTarget as HTMLElement).dataset.action;
          const input = (
            e.currentTarget as HTMLElement
          ).parentElement?.querySelector("input") as HTMLInputElement;
          if (!input) return;
          const step = parseFloat(input.step) || 0.5;
          let value = parseFloat(input.value) || 0;

          if (action === "increase") {
            value += step;
          } else if (action === "decrease") {
            value = Math.max(0, value - step);
          }

          input.value = value.toFixed(1);
          this.updateStatus();
        });
      });

    // Enter key navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (this.currentStep === this.totalSteps) {
          this.submit();
        } else {
          this.nextStep();
        }
      }
    });

    // Store input values
    document.querySelectorAll("[data-field]").forEach((input) => {
      input.addEventListener("input", (e) => {
        const field = (e.target as HTMLInputElement).dataset.field;
        if (field) {
          this.data[field] = (e.target as HTMLInputElement).value;
          this.updateStatus();
        }
      });
    });
  }

  nextStep(): void {
    // Validate current step
    if (!this.validateStep()) {
      return;
    }

    // Collect data from current step
    this.collectStepData();

    if (this.currentStep < this.totalSteps) {
      this.goToStep(this.currentStep + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  goToStep(stepNumber: number): void {
    const currentStepEl = document.querySelector(
      `[data-step="${this.currentStep}"]`,
    ) as HTMLElement;
    const nextStepEl = document.querySelector(
      `[data-step="${stepNumber}"]`,
    ) as HTMLElement;

    if (!nextStepEl) return;

    // Remove active classes from current, add prev classes
    currentStepEl.classList.remove(
      "opacity-100",
      "translate-x-0",
      "pointer-events-auto",
    );
    currentStepEl.classList.add(
      "opacity-0",
      "-translate-x-full",
      "pointer-events-none",
    );

    // Add active classes to next, remove prev/inactive
    setTimeout(() => {
      nextStepEl.classList.remove(
        "opacity-0",
        "translate-x-full",
        "pointer-events-none",
        "-translate-x-full",
      );
      nextStepEl.classList.add(
        "opacity-100",
        "translate-x-0",
        "pointer-events-auto",
      );
      this.currentStep = stepNumber;
      this.focusCurrentInput();
      this.updateStatus();
    }, 50);
  }

  setActiveStep(stepNumber: number): void {
    const stepEl = document.querySelector(
      `[data-step="${stepNumber}"]`,
    ) as HTMLElement;
    stepEl.classList.remove(
      "opacity-0",
      "translate-x-full",
      "pointer-events-none",
    );
    stepEl.classList.add("opacity-100", "translate-x-0", "pointer-events-auto");
    this.currentStep = stepNumber;
    this.focusCurrentInput();
    this.updateStatus();
  }

  validateStep(): boolean {
    if (this.currentStep === 1) {
      const nameInput = document.getElementById(
        "wizard-name",
      ) as HTMLInputElement;
      if (!nameInput.value || nameInput.value.length < 2) {
        nameInput.classList.add("border-red-500");
        nameInput.focus();
        setTimeout(() => {
          nameInput.classList.remove("border-red-500");
        }, 1000);
        return false;
      }
    } else if (this.currentStep === 2) {
      if (!this.data.genetics) {
        // Highlight the options or show error
        const options = document.querySelectorAll("[data-value]");
        options.forEach((opt) => opt.classList.add("border-red-500"));
        setTimeout(() => {
          options.forEach((opt) => opt.classList.remove("border-red-500"));
        }, 1000);
        return false;
      }
    }
    return true;
  }

  collectStepData(): void {
    const currentStepEl = document.querySelector(
      `[data-step="${this.currentStep}"]`,
    ) as HTMLElement;
    const inputs = currentStepEl.querySelectorAll(
      "[data-field]",
    ) as NodeListOf<HTMLInputElement>;

    inputs.forEach((input) => {
      const field = input.dataset.field;
      if (field) {
        this.data[field] = input.value;
      }
    });
  }

  focusCurrentInput(): void {
    setTimeout(() => {
      const currentStepEl = document.querySelector(
        `[data-step="${this.currentStep}"]`,
      ) as HTMLElement;
      const input = currentStepEl.querySelector(
        'input:not([type="hidden"]), textarea',
      ) as HTMLInputElement | HTMLTextAreaElement;
      if (input && this.currentStep !== 2) {
        // Skip auto-focus for button selection step
        input.focus();
      }
    }, 450); // Wait for transition
  }

  updateStatus(): void {
    const statusEl = document.querySelector(
      `[data-step="${this.currentStep}"] #step-status`,
    ) as HTMLElement;
    if (!statusEl) return;

    let statusText = "";
    if (this.data.name) statusText += `${this.data.name}\n`;
    if (this.data.genetics) statusText += `${this.data.genetics}\n`;
    if (this.data["thc-content"])
      statusText += `THC: ${this.data["thc-content"]}%\n`;
    if (this.data["cbd-content"])
      statusText += `CBD: ${this.data["cbd-content"]}%\n`;
    if (this.data.notes) statusText += `${this.data.notes}\n`;

    statusEl.textContent = statusText.trim();
  }

  submit(): void {
    // Collect final step data
    this.collectStepData();

    // Populate hidden form
    const formName = document.getElementById("form-name") as HTMLInputElement;
    const formGenetics = document.getElementById(
      "form-genetics",
    ) as HTMLInputElement;
    const formThc = document.getElementById("form-thc") as HTMLInputElement;
    const formCbd = document.getElementById("form-cbd") as HTMLInputElement;
    const formNotes = document.getElementById("form-notes") as HTMLInputElement;

    formName.value = this.data.name || "";
    formGenetics.value = this.data.genetics || "hybrid";
    formThc.value = this.data["thc-content"] || "0";
    formCbd.value = this.data["cbd-content"] || "0";
    formNotes.value = this.data.notes || "";

    // Submit the form
    const form = document.getElementById("wizard-form") as HTMLFormElement;
    form.submit();
  }
}

export default StrainWizard;
