import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  ClickAwayListener,
  Slide,
} from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TuneIcon from '@mui/icons-material/Tune';
import { ModifierCriteria } from '../../utils/excelOperations';

const PANEL_WIDTH = 280;

const PINNED_STORAGE_KEY = 'cdm-modifier-panel-pinned';

function getInitialPinned(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(PINNED_STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

interface ModifierPanelProps {
  criteria: ModifierCriteria;
  onCriteriaChange: (criteria: ModifierCriteria) => void;
  onPinnedChange?: (pinned: boolean) => void;
}

const ModifierPanel: React.FC<ModifierPanelProps> = ({
  criteria,
  onCriteriaChange,
  onPinnedChange,
}) => {
  const [pinned, setPinned] = useState(getInitialPinned);
  const [open, setOpen] = useState(pinned);

  // Notify parent of initial pinned state on mount
  useEffect(() => {
    onPinnedChange?.(pinned);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCriteriaChange = useCallback((field: keyof ModifierCriteria) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onCriteriaChange({
      ...criteria,
      [field]: event.target.checked,
    });
  }, [criteria, onCriteriaChange]);

  const handleClickAway = useCallback(() => {
    if (!pinned && open) {
      setOpen(false);
    }
  }, [pinned, open]);

  const handlePin = useCallback(() => {
    const newPinned = !pinned;
    setPinned(newPinned);
    localStorage.setItem(PINNED_STORAGE_KEY, String(newPinned));
    onPinnedChange?.(newPinned);
  }, [pinned, onPinnedChange]);

  const handleClose = useCallback(() => {
    setPinned(false);
    setOpen(false);
    localStorage.setItem(PINNED_STORAGE_KEY, 'false');
    onPinnedChange?.(false);
  }, [onPinnedChange]);

  const panelContent = (
    <Paper
      elevation={open ? 8 : 0}
      sx={{
        width: PANEL_WIDTH,
        height: '100%',
        overflow: 'auto',
        borderLeft: '1px solid #e0e0e0',
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.9rem' }}>
            Modifier Criteria
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.25 }}>
            <Tooltip title={pinned ? 'Unpin panel' : 'Pin panel open'}>
              <IconButton size="small" onClick={handlePin}>
                {pinned ? <PushPinIcon fontSize="small" color="primary" /> : <PushPinOutlinedIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Close panel">
              <IconButton size="small" onClick={handleClose}>
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.3 }}>
          Changes apply immediately to comparison results.
        </Typography>

        <Divider sx={{ mb: 1 }} />

        {/* Modifier checkboxes */}
        <FormGroup sx={{ gap: -0.5 }}>
          <FormControlLabel
            control={<Checkbox size="small" checked={criteria.root00} onChange={handleCriteriaChange('root00')} />}
            label={<Typography variant="body2">Treat empty/00 as root</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={criteria.root25} onChange={handleCriteriaChange('root25')} />}
            label={<Typography variant="body2">Treat 25 as root</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={criteria.root50} onChange={handleCriteriaChange('root50')} />}
            label={<Typography variant="body2">Treat 50 as root</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={criteria.root59} onChange={handleCriteriaChange('root59')} />}
            label={<Typography variant="body2">Treat 59 as root</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={criteria.rootXU} onChange={handleCriteriaChange('rootXU')} />}
            label={<Typography variant="body2">Treat XU as root</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={criteria.root76} onChange={handleCriteriaChange('root76')} />}
            label={<Typography variant="body2">Treat 76 as root</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={criteria.ignoreTrauma} onChange={handleCriteriaChange('ignoreTrauma')} />}
            label={<Typography variant="body2">Ignore trauma codes</Typography>}
          />
        </FormGroup>

      </Box>
    </Paper>
  );

  return (
    <>
      {/* Floating tab to open the panel */}
      {!open && (
        <Tooltip title="Modifier Criteria" placement="left">
          <IconButton
            onClick={() => setOpen(true)}
            sx={{
              position: 'fixed',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1200,
              bgcolor: '#1976d2',
              color: '#fff',
              borderRadius: '8px 0 0 8px',
              width: 36,
              height: 64,
              '&:hover': { bgcolor: '#1565c0' },
              boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
            }}
          >
            <TuneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {/* Slide-out panel */}
      <Slide direction="left" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: pinned ? 1100 : 1300,
            width: PANEL_WIDTH,
          }}
        >
          <ClickAwayListener onClickAway={handleClickAway}>
            {panelContent}
          </ClickAwayListener>
        </Box>
      </Slide>

      {/* Backdrop for non-pinned state */}
      {open && !pinned && (
        <Box
          onClick={handleClickAway}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1299,
            bgcolor: 'rgba(0,0,0,0.1)',
          }}
        />
      )}
    </>
  );
};

export default ModifierPanel;
