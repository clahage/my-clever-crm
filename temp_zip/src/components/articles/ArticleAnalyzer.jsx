import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box, Paper, Grid, Typography, Button, IconButton, TextField, Checkbox,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead,
  TableRow, TableCell, TableBody, TableContainer, CircularProgress, Chip,
  Accordion, AccordionSummary, AccordionDetails, Tooltip, Divider
} from '@mui/material';
import { ExpandMore, ContentCopy, Delete, InsertLink, GetApp, UploadFile } from '@mui/icons-material';
import DOMPurify from 'dompurify';
import { identifyAffiliateOpportunities, generateSEOMetadata, detectCategory } from '../../utils/articleHelpers';
import { generateTrackingId as generateTrackingIdHelper, buildAffiliateHtml as buildAffiliateHtmlHelper, prepareDelta as prepareDeltaHelper } from '../../utils/affiliateUtils';

/**
 * ArticleAnalyzer
 * - Provides content analysis (word count, readability, headings)
 * - SEO auto-generation via helpers
 * - Integrated Affiliate Manager using identifyAffiliateOpportunities
 *
 * Props:
 *  - article (object) : current article model
 *  - onUpdate (function) : callback(updatedArticle)
 *  - compact (bool) : compact rendering
 *
 * File: src/components/articles/ArticleAnalyzer.jsx
 */

const safeText = (html = '') => {
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  } catch (e) {
    return '';
  }
};

const wordCount = (html = '') => {
  const txt = safeText(html).replace(/\s+/g, ' ').trim();
  if (!txt) return 0;
  return txt.split(' ').filter(Boolean).length;
};

const readingTimeMinutes = (html = '') => Math.max(1, Math.ceil(wordCount(html) / 200));

// Flesch-Kincaid reading ease and grade
const fleschKincaid = (text = '') => {
  const s = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const syllables = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .split(/\s+/)
    .map(w => {
      // rough syllable estimate
      const m = w.match(/[aeiouy]{1,2}/g);
      return m ? m.length : 1;
    })
    .reduce((a, b) => a + b, 0) || 1;

  const readingEase = 206.835 - 1.015 * (words / s) - 84.6 * (syllables / words);
  const gradeLevel = 0.39 * (words / s) + 11.8 * (syllables / words) - 15.59;
  return { readingEase: Math.round(readingEase * 10) / 10, gradeLevel: Math.round(gradeLevel * 10) / 10 };
};

const extractHeadings = (html = '') => {
  try {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const nodes = tmp.querySelectorAll('h1,h2,h3');
    return Array.from(nodes).map(n => ({ tag: n.tagName.toLowerCase(), text: n.textContent.trim() }));
  } catch (e) {
    return [];
  }
};

// Use pure helper (wrap for backward compatibility)
const generateTrackingId = (articleId = 'local', index = 0) => generateTrackingIdHelper(articleId, index);

const downloadJSON = (obj, filename = 'article-suggestions.json') => {
  const dataStr = JSON.stringify(obj, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const AffiliateManager = ({ article, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [selected, setSelected] = useState({});
  const [mappings, setMappings] = useState({});
  const [previewHtml, setPreviewHtml] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deltaPreview, setDeltaPreview] = useState(null);

  const articleId = article?.id || 'local';

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const opps = await identifyAffiliateOpportunities(article?.content || '');
        if (!mounted) return;
        // normalize
        const normalized = (opps || []).map((o, i) => ({ ...o, suggestedProduct: o.product || `Product ${i + 1}`, commission: o.commission || 10, index: i }));
        setOpportunities(normalized);
        const sel = {};
        const maps = {};
        normalized.forEach((o) => { sel[o.index] = false; maps[o.index] = { product: o.suggestedProduct, commission: o.commission }; });
        setSelected(sel);
        setMappings(maps);
      } catch (e) {
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [article?.content]);

  const toggleSelect = (idx) => setSelected(s => ({ ...s, [idx]: !s[idx] }));

  const handleMappingChange = (idx, field, value) => setMappings(m => ({ ...m, [idx]: { ...m[idx], [field]: value } }));

  const buildAffiliateHtml = (url, text, trackingId, product) => buildAffiliateHtmlHelper(url, text, trackingId, product);

  const prepareDelta = () => prepareDeltaHelper({ content: article?.content || '', opportunities, selected, mappings, articleId });

  const handleInsertAndTrack = () => {
    const delta = prepareDelta();
    if (!delta) return;
    setDeltaPreview(delta);
    setConfirmOpen(true);
  };

  const confirmApply = () => {
    if (!deltaPreview) return;
    const updated = { ...article };
    updated.content = deltaPreview.newContent;
    updated.monetization = updated.monetization || { affiliateLinks: [] };
    updated.monetization.affiliateLinks = [...(updated.monetization.affiliateLinks || []), ...deltaPreview.addedLinks];
    if (onUpdate) onUpdate(updated);
    setConfirmOpen(false);
    setDeltaPreview(null);
  };

  const handlePreview = (html) => setPreviewHtml(html);

  const removeAffiliate = (trackingId) => {
    if (!article) return;
    const updated = { ...article };
    updated.monetization = updated.monetization || { affiliateLinks: [] };
    updated.monetization.affiliateLinks = (updated.monetization.affiliateLinks || []).filter(l => l.trackingId !== trackingId);
    if (onUpdate) onUpdate(updated);
  };

  const exportSuggestions = () => {
    const payload = { opportunities, mappings, articleId };
    downloadJSON(payload, `affiliate-suggestions-${articleId}.json`);
  };

  const importFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const obj = JSON.parse(e.target.result);
        if (obj && Array.isArray(obj.opportunities)) {
          setOpportunities(obj.opportunities);
          const sel = {};
          const maps = {};
          obj.opportunities.forEach((o) => { sel[o.index] = false; maps[o.index] = { product: o.product || o.suggestedProduct, commission: o.commission || 0 }; });
          setSelected(sel);
          setMappings(maps);
        }
      } catch (err) {
        // ignore
      }
    };
    reader.readAsText(file);
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Affiliate Opportunities</Typography>
        <Box>
          <Button startIcon={<GetApp />} onClick={exportSuggestions} sx={{ mr: 1 }}>Export</Button>
          <input id="aff-import" type="file" accept="application/json" style={{ display: 'none' }} onChange={(e) => importFile(e.target.files[0])} />
          <label htmlFor="aff-import"><Button component="span" startIcon={<UploadFile />}>Import</Button></label>
        </Box>
      </Box>

      {loading && <CircularProgress size={24} />}

      {!loading && opportunities.length === 0 && (
        <Typography variant="body2">No automatic affiliate opportunities found. You can add links manually below.</Typography>
      )}

      {opportunities.map((o) => (
        <Paper key={o.index} sx={{ p: 1, mb: 1 }}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Typography variant="body2"><strong>Excerpt:</strong> {o.text}</Typography>
              <Typography variant="caption" color="text.secondary">Context: {o.context ? o.context.substring(0, 200) : '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Checkbox checked={!!selected[o.index]} onChange={() => toggleSelect(o.index)} />
                <TextField size="small" label="Product" value={(mappings[o.index] && mappings[o.index].product) || ''} onChange={(e) => handleMappingChange(o.index, 'product', e.target.value)} />
                <TextField size="small" label="URL" value={(mappings[o.index] && mappings[o.index].url) || ''} onChange={(e) => handleMappingChange(o.index, 'url', e.target.value)} />
                <TextField size="small" label="Commission" value={(mappings[o.index] && mappings[o.index].commission) || ''} onChange={(e) => handleMappingChange(o.index, 'commission', e.target.value)} />
                <Button size="small" onClick={() => handlePreview(buildAffiliateHtml(mappings[o.index]?.url, o.text, generateTrackingId(articleId, o.index), mappings[o.index]?.product || 'Product'))}>Preview</Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      ))}

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={handleInsertAndTrack} disabled={!Object.values(selected).some(Boolean)}>Insert & Track</Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1">Existing Affiliate Links</Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Product</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Commission</TableCell>
              <TableCell>Tracking ID</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(article?.monetization?.affiliateLinks || []).map((l) => (
              <TableRow key={l.trackingId || l.url}>
                <TableCell>{l.product || '—'}</TableCell>
                <TableCell>{(l.url || '').slice(0, 60)}</TableCell>
                <TableCell>${(l.commission || 0)}</TableCell>
                <TableCell>{l.trackingId}</TableCell>
                <TableCell>
                  <Tooltip title="Copy URL"><IconButton size="small" onClick={() => { navigator.clipboard.writeText(l.url || ''); }}><ContentCopy /></IconButton></Tooltip>
                  <Tooltip title="Preview"><IconButton size="small" onClick={() => handlePreview(buildAffiliateHtml(l.url, l.text || l.product || 'link', l.trackingId, l.product))}><InsertLink /></IconButton></Tooltip>
                  <Tooltip title="Remove"><IconButton size="small" onClick={() => removeAffiliate(l.trackingId)}><Delete /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Preview modal */}
      <Dialog open={!!previewHtml} onClose={() => setPreviewHtml(null)} maxWidth="md" fullWidth>
        <DialogTitle>Preview Link HTML</DialogTitle>
        <DialogContent>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewHtml || '') }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewHtml(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm apply modal */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Confirm Insert & Track</DialogTitle>
        <DialogContent>
          <Typography variant="body2">You are about to insert {deltaPreview?.addedLinks?.length || 0} affiliate link(s). This will modify the article content. Review the changes below.</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">First affected sample</Typography>
            <Typography variant="body2">Old excerpt (first):</Typography>
            <Box sx={{ p: 1, bgcolor: '#fafafa', borderRadius: 1, mb: 1 }}>{deltaPreview?.addedLinks?.[0]?.text}</Box>
            <Typography variant="body2">New HTML preview:</Typography>
            <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 1, border: '1px solid #eee' }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(deltaPreview?.newContent?.substring(0, 800) || '') }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmOpen(false); setDeltaPreview(null); }}>Cancel</Button>
          <Button variant="contained" onClick={confirmApply}>Apply Changes</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const ArticleAnalyzer = ({ article, onUpdate, compact }) => {
  const [localArticle, setLocalArticle] = useState(article || null);
  useEffect(() => setLocalArticle(article || null), [article]);

  const text = useMemo(() => safeText(localArticle?.content || ''), [localArticle]);
  const wc = useMemo(() => wordCount(localArticle?.content || ''), [localArticle]);
  const rt = useMemo(() => readingTimeMinutes(localArticle?.content || ''), [localArticle]);
  const fk = useMemo(() => fleschKincaid(text), [text]);
  const headings = useMemo(() => extractHeadings(localArticle?.content || ''), [localArticle]);

  const handleAcceptSEO = async () => {
    try {
      const seo = await generateSEOMetadata(localArticle?.title || '', localArticle?.content || '');
      const updated = { ...(localArticle || {}), seo };
      setLocalArticle(updated);
      if (onUpdate) onUpdate(updated);
    } catch (e) {
      // ignore
    }
  };

  const handleUpdate = (updates) => {
    const updated = { ...(localArticle || {}), ...updates };
    setLocalArticle(updated);
    if (onUpdate) onUpdate(updated);
  };

  if (!localArticle) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="body2">No article selected. Open an article to use the analyzer.</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Content Summary</Typography>
            <Typography variant="body2">Words: {wc}</Typography>
            <Typography variant="body2">Read time: {rt} min</Typography>
            <Typography variant="body2">Flesch Reading Ease: {fk.readingEase} (Grade {fk.gradeLevel})</Typography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">Headings Outline</Typography>
            {headings.length === 0 && <Typography variant="caption">No headings found</Typography>}
            {headings.map((h, i) => <Chip key={i} label={`${h.tag}: ${h.text}`} sx={{ mr: 1, mb: 1 }} />)}
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6">SEO</Typography>
            <Typography variant="caption">Meta Title</Typography>
            <TextField fullWidth size="small" value={localArticle.seo?.metaTitle || ''} onChange={(e) => handleUpdate({ seo: { ...(localArticle.seo || {}), metaTitle: e.target.value } })} sx={{ mb: 1 }} />
            <Typography variant="caption">Meta Description</Typography>
            <TextField fullWidth size="small" value={localArticle.seo?.metaDescription || ''} onChange={(e) => handleUpdate({ seo: { ...(localArticle.seo || {}), metaDescription: e.target.value } })} sx={{ mb: 1 }} />
            <Button variant="outlined" onClick={handleAcceptSEO}>Auto-generate SEO</Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6">Structure Guidance</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2">{headings.length === 0 ? 'No headings (H1–H3) found. Consider adding H2 sections.' : `${headings.length} headings found.`}</Typography>
              <Button onClick={() => { const suggestions = ['Intro', 'Problem', 'Solution', 'How it works', 'Conclusion']; alert('Suggested outline:\n' + suggestions.join('\n')); }}>Show Outline Suggestions</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <AffiliateManager article={localArticle} onUpdate={(a) => { setLocalArticle(a); if (onUpdate) onUpdate(a); }} />
    </Box>
  );
};

ArticleAnalyzer.propTypes = {
  article: PropTypes.object,
  onUpdate: PropTypes.func,
  compact: PropTypes.bool
};

export default ArticleAnalyzer;
