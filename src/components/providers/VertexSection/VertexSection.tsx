import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import iconVertex from '@/assets/icons/vertex.svg';
import type { ProviderKeyConfig } from '@/types';
import { maskApiKey } from '@/utils/format';
import {
  buildCandidateUsageSourceIds,
  calculateStatusBarData,
  type KeyStats,
} from '@/utils/usage';
import {
  collectUsageDetailsForCandidates,
  type UsageDetailsBySource,
} from '@/utils/usageIndex';
import styles from '@/pages/AiProvidersPage.module.scss';
import cardStyles from '../ProviderCard/ProviderCard.module.scss';
import { ProviderCard } from '../ProviderCard/ProviderCard';
import { getStatsBySource, hasDisableAllModelsRule } from '../utils';

interface VertexSectionProps {
  configs: ProviderKeyConfig[];
  keyStats: KeyStats;
  usageDetailsBySource: UsageDetailsBySource;
  loading: boolean;
  disableControls: boolean;
  isSwitching: boolean;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onToggle: (index: number, enabled: boolean) => void;
}

export function VertexSection({
  configs,
  keyStats,
  usageDetailsBySource,
  loading,
  disableControls,
  isSwitching,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: VertexSectionProps) {
  const { t } = useTranslation();
  const actionsDisabled = disableControls || loading || isSwitching;
  const toggleDisabled = disableControls || loading || isSwitching;

  const statusBarCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof calculateStatusBarData>>();
    configs.forEach((config) => {
      if (!config.apiKey) return;
      const candidates = buildCandidateUsageSourceIds({
        apiKey: config.apiKey,
        prefix: config.prefix,
      });
      if (!candidates.length) return;
      cache.set(
        config.apiKey,
        calculateStatusBarData(collectUsageDetailsForCandidates(usageDetailsBySource, candidates))
      );
    });
    return cache;
  }, [configs, usageDetailsBySource]);

  return (
    <section className={styles.providerSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <img src={iconVertex} alt="" className={styles.sectionIcon} />
          {t('ai_providers.vertex_title')}
          {configs.length > 0 && (
            <span className={styles.countBadge}>{configs.length}</span>
          )}
        </h3>
        <Button size="sm" onClick={onAdd} disabled={actionsDisabled}>
          {t('ai_providers.vertex_add_button')}
        </Button>
      </div>

      {loading && configs.length === 0 ? (
        <div className="hint">{t('common.loading')}</div>
      ) : configs.length === 0 ? (
        <EmptyState
          title={t('ai_providers.vertex_empty_title')}
          description={t('ai_providers.vertex_empty_desc')}
        />
      ) : (
        <div className={styles.providerGrid}>
          {configs.map((item, index) => {
            const stats = getStatsBySource(item.apiKey, keyStats, item.prefix);
            const headerEntries = Object.entries(item.headers || {});
            const configDisabled = hasDisableAllModelsRule(item.excludedModels);
            const excludedModels = item.excludedModels ?? [];
            const statusData = statusBarCache.get(item.apiKey) || calculateStatusBarData([]);

            return (
              <ProviderCard
                key={item.apiKey}
                icon={iconVertex}
                title={t('ai_providers.vertex_item_title')}
                index={index}
                disabled={configDisabled}
                stats={stats}
                statusData={statusData}
                onEdit={() => onEdit(index)}
                onDelete={() => onDelete(index)}
                onToggle={(enabled: boolean) => void onToggle(index, enabled)}
                toggleDisabled={toggleDisabled}
                deleteDisabled={actionsDisabled}
              >
                <div className={cardStyles.metaRow}>
                  <span className={cardStyles.metaLabel}>{t('common.api_key')}:</span>
                  <span className={cardStyles.metaValue}>{maskApiKey(item.apiKey)}</span>
                </div>
                {item.prefix && (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>{t('common.prefix')}:</span>
                    <span className={cardStyles.metaValue}>{item.prefix}</span>
                  </div>
                )}
                {item.baseUrl && (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>{t('common.base_url')}:</span>
                    <span className={cardStyles.metaValue}>{item.baseUrl}</span>
                  </div>
                )}
                {item.proxyUrl && (
                  <div className={cardStyles.metaRow}>
                    <span className={cardStyles.metaLabel}>{t('common.proxy_url')}:</span>
                    <span className={cardStyles.metaValue}>{item.proxyUrl}</span>
                  </div>
                )}
                {headerEntries.length > 0 && (
                  <div className={cardStyles.headerBadgeList}>
                    {headerEntries.map(([key, value]) => (
                      <span key={key} className={cardStyles.headerBadge}>
                        <strong>{key}:</strong> {value}
                      </span>
                    ))}
                  </div>
                )}
                {item.models?.length ? (
                  <div className={cardStyles.modelTagList}>
                    <span className={cardStyles.modelCountLabel}>
                      {t('ai_providers.vertex_models_count')}: {item.models.length}
                    </span>
                    {item.models.map((model) => (
                      <span key={`${model.name}-${model.alias || 'default'}`} className={cardStyles.modelTag}>
                        <span className={cardStyles.modelName}>{model.name}</span>
                        {model.alias && (
                          <span className={cardStyles.modelAlias}>{model.alias}</span>
                        )}
                      </span>
                    ))}
                  </div>
                ) : null}
                {excludedModels.length ? (
                  <div className={cardStyles.excludedModelsSection}>
                    <div className={cardStyles.excludedModelsLabel}>
                      {t('ai_providers.excluded_models_count', { count: excludedModels.length })}
                    </div>
                    <div className={cardStyles.modelTagList}>
                      {excludedModels.map((model) => (
                        <span key={model} className={`${cardStyles.modelTag} ${cardStyles.excludedModelTag}`}>
                          <span className={cardStyles.modelName}>{model}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </ProviderCard>
            );
          })}
        </div>
      )}
    </section>
  );
}