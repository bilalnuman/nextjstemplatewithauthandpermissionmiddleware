"use client";

import React from "react";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Input,
    Button,
    Select,
    SelectItem,
    Autocomplete,
    AutocompleteItem,
    Divider,
    DatePicker,
    DateRangePicker,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Chip,
} from "@heroui/react";

import { useForm, Controller } from "react-hook-form";
import type { DateValue } from "@internationalized/date";
import { parseDate } from "@internationalized/date";

type FormValues = {
    fullName: string;
    email: string;
    age: string;
    password: string;
    confirmPassword: string;
    country: string;
    roles: string[];
    date: string;
    rangeStart: string;
    rangeEnd: string;
    plan: string;
};

const COUNTRIES = [
    { key: "pk", label: "Pakistan" },
    { key: "us", label: "United States" },
    { key: "uk", label: "United Kingdom" },
    { key: "de", label: "Germany" },
    { key: "fr", label: "France" },
];

const ROLES = [
    { key: "frontend", label: "Frontend Engineer" },
    { key: "backend", label: "Backend Engineer" },
    { key: "fullstack", label: "Fullstack Engineer" },
    { key: "designer", label: "Product Designer" },
    { key: "pm", label: "Product Manager" },
];

const PLANS = [
    { key: "free", label: "Free" },
    { key: "pro", label: "Pro" },
    { key: "business", label: "Business" },
];

// Date helpers
function dateValueToYmd(v: DateValue | null | undefined) {
    if (!v) return "";
    return `${v.year}-${String(v.month).padStart(2, "0")}-${String(v.day).padStart(2, "0")}`;
}

function ymdToDateValue(ymd: string) {
    if (!ymd) return undefined;
    try {
        return parseDate(ymd);
    } catch {
        return undefined;
    }
}

export default function CompleteForm() {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        reset,
    } = useForm<FormValues>({
        defaultValues: {
            fullName: "",
            email: "",
            age: "",
            password: "",
            confirmPassword: "",
            country: "",
            roles: [],
            date: "",
            rangeStart: "",
            rangeEnd: "",
            plan: "",
        },
    });

    const passwordValue = watch("password");
    const rangeStart = watch("rangeStart");
    const rangeEnd = watch("rangeEnd");
    const plan = watch("plan");

    const selectedPlanLabel =
        PLANS.find((p) => p.key === plan)?.label ?? "Choose a plan";

    const onSubmit = async (data: FormValues) => {
        await new Promise((r) => setTimeout(r, 500));
        console.log("Submitted:", data);
    };

    return (
        <div className="min-h-screen flex-1 flex items-center justify-center bg-gradient-to-b from-zinc-50 to-white p-6">
            <div className="w-full max-w-2xl mx-auto">
                <Card className="shadow-lg">
                    <CardHeader>
                        <div>
                            <h1 className="text-2xl font-semibold">Create Account</h1>
                            <p className="text-sm text-default-500">
                                HeroUI + RHF + Tailwind
                            </p>
                        </div>
                    </CardHeader>

                    <Divider />

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardBody className="gap-5">

                            {/* Name */}
                            <Input
                                label="Full Name"
                                variant="bordered"
                                isInvalid={!!errors.fullName}
                                errorMessage={errors.fullName?.message}
                                {...register("fullName", { required: "Required" })}
                            />

                            {/* Email */}
                            <Input
                                label="Email"
                                type="email"
                                variant="bordered"
                                isInvalid={!!errors.email}
                                errorMessage={errors.email?.message}
                                {...register("email", {
                                    required: "Required",
                                    validate: (v) =>
                                        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ||
                                        "Invalid email",
                                })}
                            />

                            {/* Age */}
                            <Input
                                label="Age"
                                variant="bordered"
                                inputMode="numeric"
                                isInvalid={!!errors.age}
                                errorMessage={errors.age?.message}
                                {...register("age", {
                                    required: "Required",
                                    onChange: (e) =>
                                        (e.target.value = e.target.value.replace(/\D/g, "")),
                                })}
                            />

                            {/* Plan Dropdown */}
                            <Controller
                                control={control}
                                name="plan"
                                rules={{ required: "Select a plan" }}
                                render={({ field }) => (
                                    <div>
                                        <p className="text-sm font-medium mb-1">Plan</p>
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button variant="bordered" className="w-full">
                                                    {selectedPlanLabel}
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                selectionMode="single"
                                                selectedKeys={field.value ? new Set([field.value]) : new Set([])}
                                                onSelectionChange={(keys) =>
                                                    field.onChange(Array.from(keys)[0])
                                                }
                                            >
                                                {PLANS.map((p) => (
                                                    <DropdownItem key={p.key}>
                                                        {p.label}
                                                    </DropdownItem>
                                                ))}
                                            </DropdownMenu>
                                        </Dropdown>
                                        {errors.plan && (
                                            <p className="text-danger text-xs mt-1">
                                                {errors.plan.message}
                                            </p>
                                        )}
                                    </div>
                                )}
                            />

                            {/* Date */}
                            <Controller
                                control={control}
                                name="date"
                                rules={{ required: "Date required" }}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Date"
                                        variant="bordered"
                                        value={ymdToDateValue(field.value)}
                                        onChange={(v) => field.onChange(dateValueToYmd(v))}
                                        isInvalid={!!errors.date}
                                        errorMessage={errors.date?.message}
                                    />
                                )}
                            />

                            {/* Date Range */}
                            <DateRangePicker
                                label="Date Range"
                                variant="bordered"
                                value={
                                    rangeStart && rangeEnd
                                        ? {
                                            start: ymdToDateValue(rangeStart)!,
                                            end: ymdToDateValue(rangeEnd)!,
                                        }
                                        : undefined
                                }
                                onChange={(range) => {
                                    setValue("rangeStart", dateValueToYmd(range?.start), {
                                        shouldValidate: true,
                                    });
                                    setValue("rangeEnd", dateValueToYmd(range?.end), {
                                        shouldValidate: true,
                                    });
                                }}
                            />

                            <input
                                type="hidden"
                                {...register("rangeStart", { required: "Start required" })}
                            />
                            <input
                                type="hidden"
                                {...register("rangeEnd", {
                                    required: "End required",
                                    validate: (v) =>
                                        !rangeStart || v >= rangeStart || "End must be after start",
                                })}
                            />

                            {/* Roles - Autocomplete Multi */}
                            <Controller
                                control={control}
                                name="roles"
                                rules={{
                                    validate: (v) =>
                                        v?.length ? true : "Select at least one role",
                                }}
                                render={({ field }) => {
                                    const selected = field.value ?? [];

                                    return (
                                        <div className="space-y-2">
                                            <Autocomplete
                                                label="Roles"
                                                variant="bordered"
                                                onSelectionChange={(key) => {
                                                    const k = key as string;
                                                    if (!k || selected.includes(k)) return;
                                                    field.onChange([...selected, k]);
                                                }}
                                                isInvalid={!!errors.roles}
                                                errorMessage={
                                                    errors.roles?.message as string
                                                }
                                            >
                                                {ROLES.map((r) => (
                                                    <AutocompleteItem
                                                        key={r.key}
                                                        isDisabled={selected.includes(r.key)}
                                                    >
                                                        {r.label}
                                                    </AutocompleteItem>
                                                ))}
                                            </Autocomplete>

                                            <div className="flex flex-wrap gap-2">
                                                {selected.map((k) => (
                                                    <Chip
                                                        key={k}
                                                        onClose={() =>
                                                            field.onChange(
                                                                selected.filter((x) => x !== k)
                                                            )
                                                        }
                                                    >
                                                        {
                                                            ROLES.find((r) => r.key === k)
                                                                ?.label
                                                        }
                                                    </Chip>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                }}
                            />

                            {/* Country */}
                            <Controller
                                control={control}
                                name="country"
                                rules={{ required: "Country required" }}
                                render={({ field }) => (
                                    <Select
                                        label="Country"
                                        variant="bordered"
                                        selectedKeys={
                                            field.value ? new Set([field.value]) : new Set([])
                                        }
                                        onSelectionChange={(keys) =>
                                            field.onChange(Array.from(keys)[0])
                                        }
                                        isInvalid={!!errors.country}
                                        errorMessage={errors.country?.message}
                                    >
                                        {COUNTRIES.map((c) => (
                                            <SelectItem key={c.key}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            />

                            {/* Password */}
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                variant="bordered"
                                isInvalid={!!errors.password}
                                errorMessage={errors.password?.message}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                        className="text-sm"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                }
                                {...register("password", { required: "Required" })}
                            />

                            {/* Confirm Password */}
                            <Input
                                label="Confirm Password"
                                type={showConfirmPassword ? "text" : "password"}
                                variant="bordered"
                                isInvalid={!!errors.confirmPassword}
                                errorMessage={errors.confirmPassword?.message}
                                endContent={
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword((prev) => !prev)
                                        }
                                        className="text-sm"
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                }
                                {...register("confirmPassword", {
                                    required: "Required",
                                    validate: (v) =>
                                        v === passwordValue ||
                                        "Passwords do not match",
                                })}
                            />

                            {isSubmitSuccessful && (
                                <div className="bg-success-50 text-success-700 p-3 rounded-lg text-sm">
                                    Submitted successfully
                                </div>
                            )}
                        </CardBody>

                        <Divider />

                        <CardFooter className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="flat"
                                onPress={() => reset()}
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                color="primary"
                                isLoading={isSubmitting}
                            >
                                Submit
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}