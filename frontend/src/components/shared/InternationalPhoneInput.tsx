import IntlTelInput from "@intl-tel-input/react";
import { cn } from "@/lib/utils";

type InternationalPhoneInputProps = {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    placeholder?: string;
};

export function InternationalPhoneInput({
    id,
    value,
    onChange,
    disabled,
    readOnly,
    placeholder = "Phone number",
}: InternationalPhoneInputProps) {
    return (
        <div
            className={cn(
                "[&_.iti]:w-full [&_.iti__tel-input]:h-9 [&_.iti__tel-input]:w-full [&_.iti__tel-input]:rounded-md [&_.iti__tel-input]:border [&_.iti__tel-input]:border-input [&_.iti__tel-input]:bg-transparent [&_.iti__tel-input]:px-3 [&_.iti__tel-input]:py-1 [&_.iti__tel-input]:text-base [&_.iti__tel-input]:shadow-xs [&_.iti__tel-input]:outline-none [&_.iti__tel-input]:transition-[color,box-shadow] [&_.iti__tel-input]:placeholder:text-muted-foreground [&_.iti__tel-input]:focus-visible:border-ring [&_.iti__tel-input]:focus-visible:ring-[3px] [&_.iti__tel-input]:focus-visible:ring-ring/50 [&_.iti__tel-input]:disabled:pointer-events-none [&_.iti__tel-input]:disabled:cursor-not-allowed [&_.iti__tel-input]:disabled:opacity-50 md:[&_.iti__tel-input]:text-sm",
                "[&_.iti__selected-country]:rounded-l-md"
            )}
        >
            <IntlTelInput
                initialCountry="mx"
                value={value}
                onChangeNumber={onChange}
                disabled={disabled}
                readOnly={readOnly}
                inputProps={{
                    id,
                    placeholder,
                    autoComplete: "tel",
                }}
            />
        </div>
    );
}
