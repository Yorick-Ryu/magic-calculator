class MagicCalculator {
    constructor() {
        this.displayElement = document.getElementById('display');
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        
        // Magic Mode properties
        this.isMagicMode = false;
        this.magicTargetValue = '';
        this.magicInputCounter = 0;
        this.plusCount = 0;

        this.init();
    }

    init() {
        document.querySelectorAll('.key').forEach(button => {
            button.addEventListener('click', () => {
                const key = button.dataset.key;
                this.handleKey(key);
                this.vibrate();
            });
        });

        document.getElementById('full-screen-btn').addEventListener('click', () => {
            this.toggleFullScreen();
        });
    }

    handleKey(key) {
        if (!isNaN(key)) {
            this.inputDigit(key);
        } else if (key === 'dot') {
            this.inputDecimal();
        } else if (key === 'clear') {
            this.reset();
        } else if (key === 'backspace') {
            this.deleteLast();
        } else if (key === 'add') {
            this.handleOperator('add');
        } else if (key === 'equals') {
            this.handleOperator('equals');
        } else {
            // Placeholder for other operators if needed, currently only add is required
            console.log('Operator not implemented:', key);
        }
        this.updateDisplay();
    }

    inputDigit(digit) {
        if (this.isMagicMode) {
            // Magic logic: Show characters from target value one by one
            if (this.magicInputCounter < this.magicTargetValue.length) {
                if (this.currentValue === '0' || this.waitingForSecondOperand) {
                    this.currentValue = this.magicTargetValue[this.magicInputCounter];
                    this.waitingForSecondOperand = false;
                } else {
                    this.currentValue += this.magicTargetValue[this.magicInputCounter];
                }
                this.magicInputCounter++;
            }
            return;
        }

        if (this.waitingForSecondOperand) {
            this.currentValue = digit;
            this.waitingForSecondOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? digit : this.currentValue + digit;
        }
    }

    inputDecimal() {
        if (this.isMagicMode) return;
        if (this.waitingForSecondOperand) {
            this.currentValue = '0.';
            this.waitingForSecondOperand = false;
            return;
        }
        if (!this.currentValue.includes('.')) {
            this.currentValue += '.';
        }
    }

    handleOperator(nextOperator) {
        const inputValue = parseFloat(this.currentValue);

        if (this.operator && this.waitingForSecondOperand) {
            this.operator = nextOperator;
            return;
        }

        if (this.previousValue === null && !isNaN(inputValue)) {
            this.previousValue = inputValue;
        } else if (this.operator) {
            const result = this.calculate(this.previousValue, inputValue, this.operator);
            this.currentValue = String(result);
            this.previousValue = result;
        }

        this.waitingForSecondOperand = true;
        this.operator = nextOperator;

        // Magic Trigger: Increment plus count
        if (nextOperator === 'add') {
            this.plusCount++;
            if (this.plusCount === 2) {
                this.prepareMagic();
            }
        }

        if (nextOperator === 'equals') {
            this.operator = null;
            this.waitingForSecondOperand = false;
            this.plusCount = 0;
            this.isMagicMode = false; // Reset magic mode after equals
        }
    }

    calculate(first, second, op) {
        if (op === 'add') return first + second;
        return second;
    }

    prepareMagic() {
        // Calculate magic target: Current Time - Already accumulated value
        const targetTime = this.getTimeAsNumber(); // e.g. 2162244 (Feb 16, 22:44)
        const currentTotal = this.previousValue || 0;
        const diff = targetTime - currentTotal;
        
        if (diff > 0) {
            this.magicTargetValue = String(diff);
            this.isMagicMode = true;
            this.magicInputCounter = 0;
        }
    }

    getTimeAsNumber() {
        // Current Time: 月日时分 format: M DD HH MM or similar
        // Based on user example: 2162227 (2月16日, 22:27)
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // Formatting: month + day(2 digits) + hours(2 digits) + minutes(2 digits)
        const formattedDay = day.toString().padStart(2, '0');
        const formattedHours = hours.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');

        return parseInt(`${month}${formattedDay}${formattedHours}${formattedMinutes}`);
    }

    reset() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
        this.isMagicMode = false;
        this.plusCount = 0;
    }

    deleteLast() {
        if (this.currentValue.length > 1) {
            this.currentValue = this.currentValue.slice(0, -1);
        } else {
            this.currentValue = '0';
        }
    }

    updateDisplay() {
        let displayValue = this.currentValue;
        // Format with commas
        if (displayValue !== 'Error') {
            const parts = displayValue.split('.');
            parts[0] = parseInt(parts[0]).toLocaleString('en-US');
            displayValue = parts.join('.');
        }
        this.displayElement.textContent = displayValue;
        
        // Adjust font size if value is too long
        const length = displayValue.length;
        if (length > 9) {
            this.displayElement.style.fontSize = '40px';
        } else if (length > 6) {
            this.displayElement.style.fontSize = '60px';
        } else {
            this.displayElement.style.fontSize = '80px';
        }
    }

    vibrate() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new MagicCalculator();
});
