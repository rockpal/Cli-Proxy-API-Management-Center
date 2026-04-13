import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { ProviderStatusBar } from '../ProviderStatusBar';
import type { StatusBarData } from '@/utils/usage';
import styles from './ProviderCard.module.scss';

export interface ProviderCardProps {
  icon: string;
  title: string;
  index: number;
  disabled?: boolean;
  stats?: { success: number; failure: number };
  statusData?: StatusBarData;
  onEdit: () => void;
  onDelete?: () => void;
  onToggle?: (enabled: boolean) => void;
  toggleDisabled?: boolean;
  deleteDisabled?: boolean;
  children?: ReactNode;
}

export function ProviderCard({
  icon,
  title,
  index,
  disabled,
  stats,
  statusData,
  onEdit,
  onDelete,
  onToggle,
  toggleDisabled,
  deleteDisabled,
  children,
}: ProviderCardProps) {
  const { t } = useTranslation();
  const isDisabled = Boolean(disabled);

  return (
    <div
      className={`${styles.providerCard} ${isDisabled ? styles.providerCardDisabled : ''}`}
    >
      {/* Card Header */}
      <div className={styles.providerCardHeader}>
        <div className={styles.providerAvatar}>
          <img src={icon} alt="" className={styles.providerAvatarImage} />
        </div>
        <div className={styles.providerCardTitleWrap}>
          <div className={styles.providerCardTitleRow}>
            <span className={styles.providerCardTitle}>{title}</span>
            <span className={styles.providerCardIndex}>#{index + 1}</span>
          </div>
          {isDisabled && (
            <span className={styles.providerCardBadge}>{t('ai_providers.config_disabled_badge')}</span>
          )}
        </div>
      </div>

      {/* Provider-specific content (meta, models, excluded models, etc.) */}
      {children && <div className={styles.providerCardContent}>{children}</div>}

      {/* Stats + Status Bar */}
      {stats && (
        <div className={styles.providerCardInsights}>
          <div className={styles.providerCardStats}>
            <span className={`${styles.statPill} ${styles.statSuccess}`}>
              {t('stats.success')}: {stats.success}
            </span>
            <span className={`${styles.statPill} ${styles.statFailure}`}>
              {t('stats.failure')}: {stats.failure}
            </span>
          </div>
          {statusData && <ProviderStatusBar statusData={statusData} />}
        </div>
      )}

      {/* Actions */}
      <div className={styles.providerCardActions}>
        <div className={styles.providerCardActionsMain}>
          <Button variant="secondary" size="sm" onClick={onEdit} disabled={deleteDisabled}>
            {t('common.edit')}
          </Button>
          {onDelete && (
            <Button variant="danger" size="sm" onClick={onDelete} disabled={deleteDisabled}>
              {t('common.delete')}
            </Button>
          )}
        </div>
        {onToggle && (
          <div className={styles.statusToggle}>
            <span className={styles.statusToggleLabel}>
              {t('ai_providers.config_toggle_label')}
            </span>
            <ToggleSwitch
              label={t('ai_providers.config_toggle_label')}
              checked={!isDisabled}
              disabled={toggleDisabled}
              onChange={onToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}
