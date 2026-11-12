import React, { useState, useEffect, useRef } from 'react';
import { WaterReading } from '../types/water';
import { formatNumberBR } from '../utils/calculations';
import { PlusCircle, Edit3, CheckCircle2, AlertCircle, X, HelpCircle, ArrowDownCircle } from 'lucide-react';

interface ReadingsFormProps {
  onSaveReading: (reading: WaterReading) => void;
  editingReading: WaterReading | null;
  onCancelEdit: () => void;
  latestReading?: WaterReading;
}

export const ReadingsForm: React.FC<ReadingsFormProps> = ({
  onSaveReading,
  editingReading,
  onCancelEdit,
  latestReading,
}) => {
  // Format current local datetime for datetime-local input (YYYY-MM-DDTHH:mm)
  const getNowLocal = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const [timestamp, setTimestamp] = useState<string>(getNowLocal());
  const [valueStr, setValueStr] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const valueInputRef = useRef<HTMLInputElement>(null);

  // Sync state when editingReading changes
  useEffect(() => {
    if (editingReading) {
      setTimestamp(editingReading.timestamp);
      setValueStr(String(editingReading.value));
      setNotes(editingReading.notes || '');
      setErrorMsg(null);
      setSuccessMsg(null);
      // focus reading value for fast correction
      setTimeout(() => valueInputRef.current?.focus(), 50);
    } else {
      // New reading default
      setTimestamp(getNowLocal());
      setValueStr('');
      setNotes('');
      setErrorMsg(null);
    }
  }, [editingReading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Validation: Timestamp
    if (!timestamp) {
      setErrorMsg('Por favor, informe a data e hora da leitura.');
      return;
    }
    const parsedDate = new Date(timestamp);
    if (isNaN(parsedDate.getTime())) {
      setErrorMsg('Data e hora inválidas. Verifique os valores preenchidos.');
      return;
    }

    // 2. Validation: Meter Value
    if (!valueStr.trim()) {
      setErrorMsg('Por favor, digite o valor exibido no hidrômetro em litros.');
      valueInputRef.current?.focus();
      return;
    }

    const numericVal = Number(valueStr);
    if (isNaN(numericVal) || !Number.isFinite(numericVal)) {
      setErrorMsg('O valor da leitura deve ser um número válido.');
      valueInputRef.current?.focus();
      return;
    }

    if (numericVal <= 0) {
      setErrorMsg('O valor do hidrômetro deve ser maior que zero.');
      valueInputRef.current?.focus();
      return;
    }

    const integerVal = Math.round(numericVal);

    // Construct reading object
    const readingToSave: WaterReading = {
      id: editingReading ? editingReading.id : `reading-${Date.now()}`,
      timestamp,
      value: integerVal,
      notes: notes.trim() || undefined,
    };

    onSaveReading(readingToSave);

    setSuccessMsg(
      editingReading
        ? `Leitura de ${formatNumberBR(integerVal)} L atualizada com sucesso!`
        : `Leitura de ${formatNumberBR(integerVal)} L cadastrada com sucesso!`
    );

    // Clear feedback message after 4s
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);

    if (!editingReading) {
      setValueStr('');
      setNotes('');
      setTimestamp(getNowLocal());
    }
  };

  const parsedCurrentVal = Number(valueStr);
  const showLesserNotice =
    !editingReading &&
    latestReading &&
    !isNaN(parsedCurrentVal) &&
    parsedCurrentVal > 0 &&
    parsedCurrentVal < latestReading.value;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              editingReading
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                : 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800/60'
            }`}
          >
            {editingReading ? <Edit3 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              {editingReading ? 'Editar Leitura Existente' : 'Registrar Nova Leitura'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingReading
                ? 'Atualize os dados gravados. O painel recalculará todos os consumos automaticamente.'
                : 'Digite o valor total em litros acumulado no hidrômetro residencial.'}
            </p>
          </div>
        </div>

        {editingReading && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancelar Edição</span>
          </button>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl flex items-center gap-2.5 text-xs text-rose-900 dark:text-rose-200 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Lesser Reading Warning Notice */}
      {showLesserNotice && (
        <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <ArrowDownCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Atenção ao valor informado: </span>
            {formatNumberBR(parsedCurrentVal)} L é menor que a leitura anterior registrada ({formatNumberBR(latestReading.value)} L). Isso gerará variação negativa, a menos que o hidrômetro tenha dado a volta ou sido substituído.
          </div>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Timestamp input */}
          <div className="sm:col-span-5">
            <label
              htmlFor="reading-timestamp"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Data e Hora da Leitura <span className="text-rose-500">*</span>
            </label>
            <input
              id="reading-timestamp"
              type="datetime-local"
              required
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors shadow-2xs font-mono"
            />
          </div>

          {/* Reading Value input */}
          <div className="sm:col-span-4">
            <label
              htmlFor="reading-value"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between"
            >
              <span>
                Leitura do Hidrômetro (Litros) <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">Ex: 149840</span>
            </label>
            <div className="relative">
              <input
                ref={valueInputRef}
                id="reading-value"
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                required
                placeholder="Ex: 142150"
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors shadow-2xs font-mono font-semibold"
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 dark:text-slate-500 select-none font-mono">
                L
              </span>
            </div>
            {valueStr && !isNaN(Number(valueStr)) && Number(valueStr) > 0 && (
              <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Equivalente a {(Number(valueStr) / 1000).toFixed(3)} m³
              </span>
            )}
          </div>

          {/* Optional Notes input */}
          <div className="sm:col-span-3">
            <label
              htmlFor="reading-notes"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1"
            >
              <span>Observação</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px]">(opcional)</span>
            </label>
            <input
              id="reading-notes"
              type="text"
              maxLength={60}
              placeholder="Ex: Faxina, Manhã..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Dica: anote os algarismos pretos (m³) multiplicados por 1.000 mais os vermelhos (L).</span>
          </div>

          <div className="flex items-center gap-2">
            {editingReading && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer ${
                editingReading
                  ? 'bg-amber-600 hover:bg-amber-700 focus:ring-2 focus:ring-amber-500'
                  : 'bg-sky-600 hover:bg-sky-500 focus:ring-2 focus:ring-sky-500'
              }`}
            >
              {editingReading ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Registrar Leitura</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
