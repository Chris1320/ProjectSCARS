"use client";

import { useState } from "react";
import { Combobox, InputBase, useCombobox } from "@mantine/core";

interface CreatableUnitSelectProps {
    value: string | undefined;
    onChange: (value: string) => void;
    unitOptions: string[];
    onAddUnit: (unit: string) => void;
    placeholder?: string;
    className?: string;
}

export function CreatableUnitSelect({
    value,
    onChange,
    unitOptions,
    onAddUnit,
    placeholder = "Select or create unit",
    className = "w-full",
}: CreatableUnitSelectProps) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [search, setSearch] = useState(value || "");

    const exactOptionMatch = unitOptions.some((item) => item === search);
    const filteredOptions = exactOptionMatch
        ? unitOptions
        : unitOptions.filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()));

    const options = filteredOptions.map((item) => (
        <Combobox.Option value={item} key={item}>
            {item}
        </Combobox.Option>
    ));

    return (
        <Combobox
            store={combobox}
            withinPortal={false}
            onOptionSubmit={(val) => {
                if (val === "$create") {
                    const newUnit = search.trim();
                    onAddUnit(newUnit);
                    onChange(newUnit);
                    setSearch(newUnit);
                } else {
                    onChange(val);
                    setSearch(val);
                }
                combobox.closeDropdown();
            }}
        >
            <Combobox.Target>
                <InputBase
                    className={className}
                    rightSection={<Combobox.Chevron />}
                    value={search}
                    onChange={(event) => {
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                        setSearch(event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => {
                        combobox.closeDropdown();
                        setSearch(value || "");
                    }}
                    placeholder={placeholder}
                    rightSectionPointerEvents="none"
                />
            </Combobox.Target>
            <Combobox.Dropdown>
                <Combobox.Options>
                    {options}
                    {!exactOptionMatch && search.trim().length > 0 && (
                        <Combobox.Option value="$create">+ Create &quot;{search}&quot;</Combobox.Option>
                    )}
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}
