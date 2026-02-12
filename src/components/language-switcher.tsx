"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文 (简体)", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ar", name: "العربية", flag: "🇸🇦" },
    { code: "pt", name: "Português", flag: "🇧🇷" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
];

export function LanguageSwitcher() {
    const locale = useLocale();

    const onSelectChange = (nextLocale: string) => {
        if (nextLocale === locale) return;
        document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
        window.location.reload();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                    <Globe className="h-4 w-4" />
                    <span className="hidden sm:inline">{languages.find((lang) => lang.code === locale)?.name || "English"}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={locale} onValueChange={onSelectChange}>
                    {languages.map((lang) => (
                        <DropdownMenuRadioItem key={lang.code} value={lang.code} className="gap-2">
                            <span className="text-base">{lang.flag}</span>
                            {lang.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
