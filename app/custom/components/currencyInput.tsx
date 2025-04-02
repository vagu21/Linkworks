import * as React from "react";
import { ChevronsUpDown, CheckIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { currencyData } from "~/custom/components/currencyUtils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

type CurrencyInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "ref"> & {
    onChange?: (value: string) => void;
    value?: string;
};


const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, onChange, value, ...props }, ref) => {

        const [countryLabel, setCountryLabel] = React.useState('INR');
        const currentSymbol = currencyData.find(item => item.abbreviation == countryLabel)?.symbol || '';
        return (
            <div className="flex gap-2">
                <CurrencySelect
                    onChange={(currency) => onChange?.(currency)}
                    selectedCurrency={value || "INR"}
                    countryLabel={countryLabel}
                    setCountryLabel={setCountryLabel}
                />
                <Input
                    ref={ref}
                    type="number"
                    value={value || new DOMParser().parseFromString("&#8377", 'text/html').body.innerHTML}
                    onChange={(e) => {
                        const currencySymbol = new DOMParser().parseFromString(currentSymbol.length ? currentSymbol : "&#8377", 'text/html').body.innerHTML;
                        let inputValue = e.target.value;

                        if (!inputValue.startsWith(currencySymbol)) {
                            inputValue = currencySymbol + inputValue.replace(/[^0-9.]/g, "");
                        } else {
                            inputValue = currencySymbol + inputValue.slice(1).replace(/[^0-9.]/g, ""); // Allow only numbers after ₹
                        }

                        onChange?.(inputValue);
                    }}
                    placeholder="0.00"
                    className={cn("flex-1", className)}
                    {...props}
                />
            </div>
        );
    }
);

CurrencyInput.displayName = "CurrencyInput";

type CurrencyEntry = { label: string; value: string };

type CurrencySelectProps = {
    disabled?: boolean;
    selectedCurrency: string;
    onChange: (currency: string) => void;
    countryLabel?: string;
    setCountryLabel: (currency: string) => void
};

const CurrencySelect = ({
    disabled,
    selectedCurrency,
    onChange,
    countryLabel,
    setCountryLabel,
}: CurrencySelectProps) => {
    const currencyList: any[] = currencyData;
    // const initialCountryLabel=selectedCurrency?currencyData.find((item:any)=>new DOMParser().parseFromString(item.symbol, 'text/html').body.innerHTML==selectedCurrency.charAt(0)):''


    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
                    disabled={disabled}
                >
                    <span className="text-sm font-medium text-foreground">
                        {/* {selectedCurrency?selectedCurrency.charAt(0):''} */}
                        {countryLabel}
                    </span>
                    <ChevronsUpDown
                        className={cn(
                            "-mr-2 size-4 opacity-50",
                            disabled ? "hidden" : "opacity-100"
                        )}
                    />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search currency..." />
                    <CommandList>
                        <ScrollArea className="h-72">
                            <CommandEmpty>No currency found.</CommandEmpty>
                            <CommandGroup>
                                {currencyList.map((currency: any) => (
                                    <CurrencySelectOption
                                        key={currency.abbreviation}
                                        value={new DOMParser().parseFromString(currency.symbol, 'text/html').body.innerHTML}
                                        label={` ${currency.abbreviation} `}
                                        selectedCurrency={selectedCurrency}
                                        onChange={() => {
                                            if (onChange) onChange(new DOMParser().parseFromString(currency.symbol, 'text/html').body.innerHTML);
                                            setCountryLabel(currency.abbreviation);
                                        }}
                                    />
                                ))}
                            </CommandGroup>
                        </ScrollArea>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

interface CurrencySelectOptionProps {
    value: string;
    label: string;
    selectedCurrency: string;
    onChange: (currency: string) => void;
}

const CurrencySelectOption = ({
    value,
    label,
    selectedCurrency,
    onChange,
}: CurrencySelectOptionProps) => {
    return (
        <CommandItem className="gap-2" onSelect={() => onChange(value)}>
            <span className="flex-1 text-sm">{label}</span>
            <CheckIcon
                className={`ml-auto size-4 ${value === selectedCurrency ? "opacity-100" : "opacity-0"}`}
            />
        </CommandItem>
    );
};

export { CurrencyInput };
