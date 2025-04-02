import * as React from "react";
import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import { Button } from "~/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { cn } from "~/lib/utils";

type PhoneInputProps = Omit<React.ComponentProps<"input">, "onChange" | "value" | "ref"> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange"> & {
    onChange?: (value: RPNInput.Value) => void;
  };

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(({ className, onChange, ...props }, ref) => {
  const [country, setCountry] = React.useState("IN") as any;
  const [number, setNumber] = React.useState(props.value ? (props.value[0] == "+" ? props.value : `+91 ${props.value}`) : null) as any;
  React.useEffect(() => {
    if (country) {
      let numberVal = number?.length ? number.replace(/^\+\d+\s*/, "") : "";
      const fullPhoneNumber: any = `+${RPNInput.getCountryCallingCode(country)}${numberVal}`;
      console.log("fullPhoneNumber", fullPhoneNumber);
      onChange?.(fullPhoneNumber);
    }
  }, [country]);
  return (
    <RPNInput.default
      inputRef={ref}
      className={cn("flex rounded-lg border focus-within:border-[#0A0501] focus:border-[#0A0501] focus:outline-none focus:ring-0", className)}
      flagComponent={FlagComponent}
      countrySelectComponent={CountrySelect}
      inputComponent={InputComponent}
      smartCaret={false}
      /**
       * Handles the onChange event.
       *
       * react-phone-number-input might trigger the onChange event as undefined
       * when a valid phone number is not entered. To prevent this,
       * the value is coerced to an empty string.
       *
       * @param {E164Number | undefined} value - The entered value
       */
      onChange={(value: any) => {
        onChange?.(value || "");
        setNumber(value);
      }}
      onCountryChange={(country: any) => {
        setCountry(country);
      }}
      {...props}
    />
  );
});
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => (
  <Input
    className={cn("rounded-e-lg rounded-s-none border-l-0  focus:outline-none focus:!ring-0 focus-visible:!outline-none focus-visible:!ring-0", className)}
    {...props}
    ref={ref}
  />
));
InputComponent.displayName = "InputComponent";

type CountryEntry = { label: string; value: RPNInput.Country | undefined };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  options: CountryEntry[];
  onChange: (country: RPNInput.Country) => void;
};

const CountrySelect = ({ disabled, value: selectedCountry, options: countryList, onChange }: CountrySelectProps) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const filteredCountries = React.useMemo(() => {
    return countryList.filter(
      ({ label }) => label.toLowerCase().includes(searchQuery.toLowerCase()) // Changed from startsWith() to includes()
    );
  }, [searchQuery, countryList]);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 bg-[#F8F8F8] px-3 focus:z-10" disabled={disabled}>
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <span className="text-foreground text-sm font-medium">{selectedCountry && `+${RPNInput.getCountryCallingCode(selectedCountry)}`}</span>
          <ChevronsUpDown className={cn("-mr-2 size-4 opacity-50", disabled ? "hidden" : "opacity-100")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput onValueChange={setSearchQuery} placeholder="Search country..." />
          <CommandList>
            <ScrollArea className="h-72">
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map(({ value, label }: any) =>
                  value ? <CountrySelectOption key={value} country={value} countryName={label} selectedCountry={selectedCountry} onChange={onChange} /> : null
                )}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

interface CountrySelectOptionProps extends RPNInput.FlagProps {
  selectedCountry: RPNInput.Country;
  onChange: (country: RPNInput.Country) => void;
}

const CountrySelectOption = ({ country, countryName, selectedCountry, onChange }: CountrySelectOptionProps) => {
  return (
    <CommandItem className="gap-2" onSelect={() => onChange(country)}>
      <FlagComponent country={country} countryName={countryName} />
      <span className="flex-1 text-sm">{countryName}</span>
      <span className="text-small text-foreground/50 font-medium">{`+${RPNInput.getCountryCallingCode(country)}`}</span>
      <CheckIcon className={`ml-auto size-4 ${country === selectedCountry ? "opacity-100" : "opacity-0"}`} />
    </CommandItem>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country];

  return <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm [&_svg]:size-full">{Flag && <Flag title={countryName} />}</span>;
};

export { PhoneInput };
