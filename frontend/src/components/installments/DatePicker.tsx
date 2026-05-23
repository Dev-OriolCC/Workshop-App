import { Input } from "@/components/ui/input";

type DatePickerProps = {
    id: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
};

export function DatePicker({ id, value, onChange, disabled }: DatePickerProps) {
    return (
        <Input
            id={id}
            type="date"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            className="bg-white"
        />
    );
}
