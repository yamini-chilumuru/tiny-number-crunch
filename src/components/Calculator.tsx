import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
}

const Calculator = () => {
  const { toast } = useToast();
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForOperand: false,
  });

  const inputNumber = useCallback((num: string) => {
    const { display, waitingForOperand } = state;

    if (waitingForOperand) {
      setState(prev => ({
        ...prev,
        display: num,
        waitingForOperand: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        display: display === '0' ? num : display + num,
      }));
    }
  }, [state]);

  const inputDecimal = useCallback(() => {
    const { display, waitingForOperand } = state;

    if (waitingForOperand) {
      setState(prev => ({
        ...prev,
        display: '0.',
        waitingForOperand: false,
      }));
    } else if (display.indexOf('.') === -1) {
      setState(prev => ({
        ...prev,
        display: display + '.',
      }));
    }
  }, [state]);

  const clear = useCallback(() => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
    });
  }, []);

  const performOperation = useCallback((nextOperation: string) => {
    const { display, previousValue, operation } = state;
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setState(prev => ({
        ...prev,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForOperand: true,
      }));
    } else if (operation) {
      const currentValue = previousValue || 0;
      let result: number;

      try {
        switch (operation) {
          case '+':
            result = currentValue + inputValue;
            break;
          case '-':
            result = currentValue - inputValue;
            break;
          case '×':
            result = currentValue * inputValue;
            break;
          case '÷':
            if (inputValue === 0) {
              toast({
                title: "Error",
                description: "Cannot divide by zero",
                variant: "destructive",
              });
              return;
            }
            result = currentValue / inputValue;
            break;
          default:
            return;
        }

        // Check for invalid results
        if (!isFinite(result)) {
          toast({
            title: "Error",
            description: "Invalid calculation",
            variant: "destructive",
          });
          clear();
          return;
        }

        // Format result to avoid floating point precision issues
        const formattedResult = parseFloat(result.toPrecision(12));
        
        setState({
          display: String(formattedResult),
          previousValue: nextOperation === '=' ? null : formattedResult,
          operation: nextOperation === '=' ? null : nextOperation,
          waitingForOperand: true,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Calculation error",
          variant: "destructive",
        });
        clear();
      }
    }
  }, [state, toast, clear]);

  const handleKeyPress = useCallback((key: string) => {
    if (/\d/.test(key)) {
      inputNumber(key);
    } else if (key === '.') {
      inputDecimal();
    } else if (key === '+' || key === '-') {
      performOperation(key);
    } else if (key === '*') {
      performOperation('×');
    } else if (key === '/') {
      performOperation('÷');
    } else if (key === '=' || key === 'Enter') {
      performOperation('=');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      clear();
    }
  }, [inputNumber, inputDecimal, performOperation, clear]);

  // Add keyboard support
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      handleKeyPress(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);

  const ButtonComponent = ({ 
    onClick, 
    className, 
    children, 
    variant = "number" 
  }: { 
    onClick: () => void; 
    className?: string; 
    children: React.ReactNode;
    variant?: "number" | "operator" | "equals" | "function";
  }) => {
    const baseClasses = "h-16 text-lg font-semibold transition-all duration-200 hover:scale-105 active:animate-button-press border-2";
    
    const variantClasses = {
      number: "bg-calculator-number hover:bg-calculator-number/80 border-calculator-number text-foreground",
      operator: "bg-calculator-operator hover:bg-calculator-operator/80 border-calculator-operator text-background",
      equals: "bg-calculator-equals hover:bg-calculator-equals/80 border-calculator-equals text-background",
      function: "bg-calculator-function hover:bg-calculator-function/80 border-calculator-function text-foreground",
    };

    return (
      <Button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
        variant="outline"
      >
        {children}
      </Button>
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm p-6 bg-card border-border shadow-2xl">
        <div className="space-y-4">
          {/* Display */}
          <div className="bg-calculator-display p-4 rounded-lg border-2 border-border">
            <div className="text-right">
              <div className="text-sm text-muted-foreground h-5">
                {state.previousValue !== null && state.operation && (
                  <span>{state.previousValue} {state.operation}</span>
                )}
              </div>
              <div className="text-3xl font-mono text-foreground truncate animate-display-update">
                {state.display}
              </div>
            </div>
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <ButtonComponent onClick={clear} className="col-span-2" variant="function">
              Clear
            </ButtonComponent>
            <ButtonComponent onClick={() => performOperation('÷')} variant="operator">
              ÷
            </ButtonComponent>
            <ButtonComponent onClick={() => performOperation('×')} variant="operator">
              ×
            </ButtonComponent>

            {/* Row 2 */}
            <ButtonComponent onClick={() => inputNumber('7')} variant="number">
              7
            </ButtonComponent>
            <ButtonComponent onClick={() => inputNumber('8')} variant="number">
              8
            </ButtonComponent>
            <ButtonComponent onClick={() => inputNumber('9')} variant="number">
              9
            </ButtonComponent>
            <ButtonComponent onClick={() => performOperation('-')} variant="operator">
              -
            </ButtonComponent>

            {/* Row 3 */}
            <ButtonComponent onClick={() => inputNumber('4')} variant="number">
              4
            </ButtonComponent>
            <ButtonComponent onClick={() => inputNumber('5')} variant="number">
              5
            </ButtonComponent>
            <ButtonComponent onClick={() => inputNumber('6')} variant="number">
              6
            </ButtonComponent>
            <ButtonComponent onClick={() => performOperation('+')} variant="operator">
              +
            </ButtonComponent>

            {/* Row 4 */}
            <ButtonComponent onClick={() => inputNumber('1')} variant="number">
              1
            </ButtonComponent>
            <ButtonComponent onClick={() => inputNumber('2')} variant="number">
              2
            </ButtonComponent>
            <ButtonComponent onClick={() => inputNumber('3')} variant="number">
              3
            </ButtonComponent>
            <ButtonComponent onClick={() => performOperation('=')} className="row-span-2" variant="equals">
              =
            </ButtonComponent>

            {/* Row 5 */}
            <ButtonComponent onClick={() => inputNumber('0')} className="col-span-2" variant="number">
              0
            </ButtonComponent>
            <ButtonComponent onClick={inputDecimal} variant="number">
              .
            </ButtonComponent>
          </div>

          {/* Keyboard hint */}
          <div className="text-xs text-muted-foreground text-center">
            Keyboard supported: Numbers, +, -, *, /, =, Enter, Escape
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Calculator;