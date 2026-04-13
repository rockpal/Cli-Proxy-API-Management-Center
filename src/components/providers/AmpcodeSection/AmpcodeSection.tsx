import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import iconAmp from '@/assets/icons/amp.svg';
import type { AmpcodeConfig } from '@/types';
import { maskApiKey } from '@/utils/format';
import styles from '@/pages/AiProvidersPage.module.scss';
import cardStyles from '../ProviderCard/ProviderCard.module.scss';
import { ProviderCard } from '../ProviderCard/ProviderCard';
import { useTranslation } from 'react-i18next';

interface AmpcodeSectionProps {
  config: AmpcodeConfig | null | undefined;
  loading: boolean;
  disableControls: boolean;
  isSwitching: boolean;
  onEdit: () => void;
}

export function AmpcodeSection({
  config,
  loading,
  disableControls,
  isSwitching,
  onEdit,
}: AmpcodeSectionProps) {
  const { t } = useTranslation();
  const showLoadingPlaceholder = loading && !config;

  return (
    <section className={styles.providerSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>
          <img src={iconAmp} alt="" className={styles.sectionIcon} />
          {t('ai_providers.ampcode_title')}
        </h3>
        <Button
          size="sm"
          onClick={onEdit}
          disabled={disableControls || loading || isSwitching}
        >
          {t('common.edit')}
        </Button>
      </div>

      {showLoadingPlaceholder ? (
        <div className="hint">{t('common.loading')}</div>
      ) : config ? (
        <div className={styles.providerGrid}>
          <ProviderCard
            icon={iconAmp}
            title={t('ai_providers.ampcode_title')}
            index={0}
            onEdit={onEdit}
            deleteDisabled={disableControls || loading || isSwitching}
          >
            <div className={cardStyles.metaRow}>
              <span className={cardStyles.metaLabel}>{t('ai_providers.ampcode_upstream_url_label')}:</span>
              <span className={cardStyles.metaValue}>{config.upstreamUrl || t('common.not_set')}</span>
            </div>
            <div className={cardStyles.metaRow}>
              <span className={cardStyles.metaLabel}>
                {t('ai_providers.ampcode_upstream_api_key_label')}:
              </span>
              <span className={cardStyles.metaValue}>
                {config.upstreamApiKey ? maskApiKey(config.upstreamApiKey) : t('common.not_set')}
              </span>
            </div>
            <div className={cardStyles.metaRow}>
              <span className={cardStyles.metaLabel}>
                {t('ai_providers.ampcode_force_model_mappings_label')}:
              </span>
              <span className={cardStyles.metaValue}>
                {(config.forceModelMappings ?? false) ? t('common.yes') : t('common.no')}
              </span>
            </div>
            <div className={cardStyles.metaRow}>
              <span className={cardStyles.metaLabel}>{t('ai_providers.ampcode_model_mappings_count')}:</span>
              <span className={cardStyles.metaValue}>{config.modelMappings?.length || 0}</span>
            </div>
            <div className={cardStyles.metaRow}>
              <span className={cardStyles.metaLabel}>{t('ai_providers.ampcode_upstream_api_keys_count')}:</span>
              <span className={cardStyles.metaValue}>{config.upstreamApiKeys?.length || 0}</span>
            </div>
            {config.modelMappings?.length ? (
              <div className={cardStyles.modelTagList}>
                {config.modelMappings.slice(0, 5).map((mapping) => (
                  <span key={`${mapping.from}→${mapping.to}`} className={cardStyles.modelTag}>
                    <span className={cardStyles.modelName}>{mapping.from}</span>
                    <span className={cardStyles.modelAlias}>{mapping.to}</span>
                  </span>
                ))}
                {config.modelMappings.length > 5 && (
                  <span className={cardStyles.modelTag}>
                    <span className={cardStyles.modelName}>+{config.modelMappings.length - 5}</span>
                  </span>
                )}
              </div>
            ) : null}
          </ProviderCard>
        </div>
      ) : (
        <EmptyState
          title={t('ai_providers.ampcode_title')}
          description={t('common.not_set')}
        />
      )}
    </section>
  );
}