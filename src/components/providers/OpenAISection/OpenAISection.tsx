import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconCheck, IconX } from '@/components/ui/icons';
import iconOpenaiLight from '@/assets/icons/openai-light.svg';
import iconOpenaiDark from '@/assets/icons/openai-dark.svg';
import type { OpenAIProviderConfig } from '@/types';
import { maskApiKey } from '@/utils/format';
import {
  buildCandidateUsageSourceIds,
  calculateStatusBarData,
  type KeyStats,
} from '@/utils/usage';
import { collectUsageDetailsForCandidates, type UsageDetailsBySource } from '@/utils/usageIndex';
import styles from '@/pages/AiProvidersPage.module.scss';
import cardStyles from '../ProviderCard/ProviderCard.module.scss';
import { ProviderCard } from '../ProviderCard/ProviderCard';
import { getOpenAIProviderStats, getStatsBySource } from '../utils';

interface OpenAISectionProps {
  configs: OpenAIProviderConfig[];
  keyStats: KeyStats;
  usageDetailsBySource: UsageDetailsBySource;
  loading: boolean;
  disableControls: boolean;
  isSwitching: boolean;
  resolvedTheme: string;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}

export function OpenAISection({
  configs,
  keyStats,
  usageDetailsBySource,
  loading,
  disableControls,
  isSwitching,
  resolvedTheme,
  onAdd,
  onEdit,
  onDelete,
}: OpenAISectionProps) {
  const { t } = useTranslation();
  const actionsDisabled = disableControls || loading || isSwitching;
  const icon = resolvedTheme === 'dark' ? iconOpenaiDark : iconOpenaiLight;

  const statusBarCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof calculateStatusBarData>>();
    configs.forEach((provider) => {
      const sourceIds = new Set<string>();
      buildCandidateUsageSourceIds({ prefix: provider.prefix }).forEach((id) => sourceIds.add(id));
      (provider.apiKeyEntries || []).forEach((entry) => {
        buildCandidateUsageSourceIds({ apiKey: entry.apiKey }).forEach((id) => sourceIds.add(id));
      });
      const filteredDetails = sourceIds.size
        ? collectUsageDetailsForCandidates(usageDetailsBySource, sourceIds)
        : [];
      cache.set(provider.name, calculateStatusBarData(filteredDetails));
    });
    return cache;
  }, [configs, usageDetailsBySource]);

  return (
    <section className={styles.providerSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <img src={icon} alt="" className={styles.sectionIcon} />
          {t('ai_providers.openai_title')}
          {configs.length > 0 && (
            <span className={styles.countBadge}>{configs.length}</span>
          )}
        </h3>
        <Button size="sm" onClick={onAdd} disabled={actionsDisabled}>
          {t('ai_providers.openai_add_button')}
        </Button>
      </div>

      {loading && configs.length === 0 ? (
        <div className="hint">{t('common.loading')}</div>
      ) : configs.length === 0 ? (
        <EmptyState
          title={t('ai_providers.openai_empty_title')}
          description={t('ai_providers.openai_empty_desc')}
        />
      ) : (
        <div className={styles.providerGrid}>
          {configs.map((item, index) => {
            const stats = getOpenAIProviderStats(item.apiKeyEntries, keyStats, item.prefix);
            const headerEntries = Object.entries(item.headers || {});
            const apiKeyEntries = item.apiKeyEntries || [];
            const statusData = statusBarCache.get(item.name) || calculateStatusBarData([]);

            return (
              <ProviderCard
                key={`openai-provider-${index}`}
                icon={icon}
                title={item.name}
                index={index}
                stats={stats}
                statusData={statusData}
                onEdit={() => onEdit(index)}
                onDelete={() => onDelete(index)}
                deleteDisabled={actionsDisabled}
              >
                {item.priority !== undefined && (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>{t('common.priority')}:</span>
                    <span className={cardStyles.metaValue}>{item.priority}</span>
                  </div>
                )}
                {item.prefix && (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>{t('common.prefix')}:</span>
                    <span className={cardStyles.metaValue}>{item.prefix}</span>
                  </div>
                )}
                <div className={cardStyles.metaRow}>
                  <span className={cardStyles.metaLabel}>{t('common.base_url')}:</span>
                  <span className={cardStyles.metaValue}>{item.baseUrl}</span>
                </div>
                {headerEntries.length > 0 && (
                  <div className={cardStyles.headerBadgeList}>
                    {headerEntries.map(([key, value]) => (
                      <span key={key} className={cardStyles.headerBadge}>
                        <strong>{key}:</strong> {value}
                      </span>
                    ))}
                  </div>
                )}
                {apiKeyEntries.length > 0 && (
                  <div className={styles.apiKeyEntriesSection}>
                    <div className={styles.apiKeyEntriesLabel}>
                      {t('ai_providers.openai_keys_count')}: {apiKeyEntries.length}
                    </div>
                    <div className={styles.apiKeyEntryList}>
                      {apiKeyEntries.map((entry, entryIndex) => {
                        const entryStats = getStatsBySource(entry.apiKey, keyStats);
                        return (
                          <div key={entryIndex} className={styles.apiKeyEntryCard}>
                            <span className={styles.apiKeyEntryIndex}>{entryIndex + 1}</span>
                            <span className={styles.apiKeyEntryKey}>{maskApiKey(entry.apiKey)}</span>
                            {entry.proxyUrl && (
                              <span className={styles.apiKeyEntryProxy}>{entry.proxyUrl}</span>
                            )}
                            <div className={styles.apiKeyEntryStats}>
                              <span className={`${styles.apiKeyEntryStat} ${styles.apiKeyEntryStatSuccess}`}>
                                <IconCheck size={12} /> {entryStats.success}
                              </span>
                              <span className={`${styles.apiKeyEntryStat} ${styles.apiKeyEntryStatFailure}`}>
                                <IconX size={12} /> {entryStats.failure}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {item.models?.length ? (
                  <div className={cardStyles.modelTagList}>
                    <span className={cardStyles.modelCountLabel}>
                      {t('ai_providers.openai_models_count')}: {item.models.length}
                    </span>
                    {item.models.map((model) => (
                      <span key={model.name} className={cardStyles.modelTag}>
                        <span className={cardStyles.modelName}>{model.name}</span>
                        {model.alias && model.alias !== model.name && (
                          <span className={cardStyles.modelAlias}>{model.alias}</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.testModel && (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>Test Model:</span>
                    <span className={cardStyles.metaValue}>{item.testModel}</span>
                  </div>
                )}
              </ProviderCard>
            );
          })}
        </div>
      )}
    </section>
  );
}