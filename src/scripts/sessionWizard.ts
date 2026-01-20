class SessionWizard {
  currentStep: number;
  totalSteps: number;
  data: Record<string, any>;

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

    // Strain selector (Step 1)
    document
      .querySelector('[data-field="strain"]')
      ?.addEventListener("change", (e) => {
        const value = (e.target as HTMLSelectElement).value;
        this.data.strain = value;
        this.updateStatus();
      });

    // Usage method buttons (Step 2)
    document.querySelectorAll("[data-value]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const value = (e.currentTarget as HTMLElement).dataset.value;
        if (value) {
          this.data.usage_method = value;
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

    // Number controls (+/- buttons) for amount
    document
      .querySelectorAll('[data-action="decrease"], [data-action="increase"]')
      .forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const action = (e.currentTarget as HTMLElement).dataset.action;
          const input = (
            e.currentTarget as HTMLElement
          ).parentElement?.querySelector("input") as HTMLInputElement;
          if (!input) return;
          const step = parseFloat(input.step) || 0.1;
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

    // Effects checkboxes (Step 4)
    document.querySelectorAll('[data-field="effects"]').forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const checked = document.querySelectorAll(
          '[data-field="effects"]:checked',
        ) as NodeListOf<HTMLInputElement>;
        this.data.effects = Array.from(checked).map((cb) => cb.value);
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
      if (
        (input as HTMLElement).tagName !== "INPUT" ||
        (input as HTMLInputElement).type !== "checkbox"
      ) {
        input.addEventListener("input", (e) => {
          const field = (e.target as HTMLInputElement).dataset.field;
          if (field) {
            this.data[field] = (e.target as HTMLInputElement).value;
            this.updateStatus();
          }
        });
      }
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
      const strainSelect = document.querySelector(
        '[data-field="strain"]',
      ) as HTMLSelectElement;
      if (!strainSelect.value) {
        strainSelect.classList.add("border-red-500");
        strainSelect.focus();
        setTimeout(() => {
          strainSelect.classList.remove("border-red-500");
        }, 1000);
        return false;
      }
    } else if (this.currentStep === 2) {
      if (!this.data.usage_method) {
        // Highlight the options or show error
        const options = document.querySelectorAll("[data-value]");
        options.forEach((opt) => opt.classList.add("border-red-500"));
        setTimeout(() => {
          options.forEach((opt) => opt.classList.remove("border-red-500"));
        }, 1000);
        return false;
      }
    } else if (this.currentStep === 3) {
      const amountInput = document.querySelector(
        '[data-field="amount"]',
      ) as HTMLInputElement;
      const amount = parseFloat(amountInput.value);
      if (isNaN(amount) || amount <= 0) {
        amountInput.classList.add("border-red-500");
        amountInput.focus();
        setTimeout(() => {
          amountInput.classList.remove("border-red-500");
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
    const inputs = currentStepEl.querySelectorAll("[data-field]") as NodeListOf<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >;

    inputs.forEach((input) => {
      const field = input.dataset.field;
      if (field) {
        if (input.type === "checkbox") {
          // Handled separately
        } else if (field === "amount") {
          // Convert grams to mg
          const grams = parseFloat(input.value);
          this.data.amount_mg = isNaN(grams) ? 0 : Math.round(grams * 1000);
        } else {
          this.data[field] = input.value;
        }
      }
    });
  }

  focusCurrentInput(): void {
    setTimeout(() => {
      const currentStepEl = document.querySelector(
        `[data-step="${this.currentStep}"]`,
      ) as HTMLElement;
      const input = currentStepEl.querySelector(
        'input:not([type="hidden"]), select, textarea',
      ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
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
    if (this.data.strain) {
      const strainName = (
        document.querySelector(
          `[data-field="strain"] option[value="${this.data.strain}"]`,
        ) as HTMLOptionElement
      )?.text;
      statusText += `${strainName}\n`;
    }
    if (this.data.usage_method) statusText += `${this.data.usage_method}\n`;
    if (this.data.amount) statusText += `Amount: ${this.data.amount}g\n`;
    if (this.data.effects && this.data.effects.length > 0)
      statusText += `Effects: ${this.data.effects.join(", ")}\n`;
    if (this.data.notes) statusText += `${this.data.notes}\n`;

    statusEl.textContent = statusText.trim();
  }

  async submit(): Promise<void> {
    // Collect final step data
    this.collectStepData();

    // Set loading state
    const submitButton = document.querySelector(
      '[data-action="submit"]',
    ) as HTMLButtonElement;
    const spinner = document.querySelector("#submit-spinner");
    submitButton.disabled = true;
    spinner?.classList.remove("hidden");

    // Validate required fields
    if (!this.data.strain || !this.data.usage_method || !this.data.amount_mg) {
      this.showError("Please fill in all required fields");
      this.resetFormState();
      return;
    }

    try {
      const response = await fetch("/api/sessions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          strain_used: this.data.strain,
          usage_method: this.data.usage_method,
          amount: this.data.amount_mg,
          effects: this.data.effects || null,
          notes: this.data.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create session");
      }

      // Show success feedback before redirect
      this.showSuccess("Session logged successfully!");
      setTimeout(() => {
        window.location.href = `/dashboard/sessions/${this.data.strain}`;
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      this.showError(
        error instanceof Error
          ? error.message
          : "Failed to create session. Please try again.",
      );
      this.resetFormState();
    }
  }

  showError(message: string): void {
    const errorEl = document.querySelector("#wizard-error") as HTMLElement;
    if (errorEl) {
      const errorText = errorEl.querySelector("p");
      if (errorText) {
        errorText.textContent = message;
      }
      errorEl.classList.remove("hidden");
      errorEl.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  showSuccess(message: string): void {
    const errorEl = document.querySelector("#wizard-error") as HTMLElement;
    if (errorEl) {
      errorEl.classList.remove(
        "hidden",
        "bg-red-100",
        "text-red-700",
        "dark:bg-red-900",
        "dark:text-red-100",
      );
      errorEl.classList.add(
        "bg-green-100",
        "text-green-700",
        "dark:bg-green-900",
        "dark:text-green-100",
      );
      const errorText = errorEl.querySelector("p");
      if (errorText) {
        errorText.textContent = message;
      }
    }
  }

  resetFormState(): void {
    const submitButton = document.querySelector(
      '[data-action="submit"]',
    ) as HTMLButtonElement;
    const spinner = document.querySelector("#submit-spinner");
    submitButton.disabled = false;
    spinner?.classList.add("hidden");
  }
}

export default SessionWizard;
