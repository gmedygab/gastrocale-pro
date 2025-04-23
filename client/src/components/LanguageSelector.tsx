import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSelector() {
  const { i18n, t } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || "en");

  useEffect(() => {
    // Update state if i18n.language changes from elsewhere
    if (i18n.language !== currentLanguage) {
      setCurrentLanguage(i18n.language);
    }
  }, [i18n.language, currentLanguage]);

  const changeLanguage = (value: string) => {
    i18n.changeLanguage(value);
    localStorage.setItem("language", value);
    setCurrentLanguage(value);
  };

  return (
    <div className="flex items-center">
      <Select value={currentLanguage} onValueChange={changeLanguage}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder={t("common.language")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="en" value="en">{t("settings.english")}</SelectItem>
          <SelectItem key="it" value="it">{t("settings.italian")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}