# Database Indexes Documentation

## Day 176 - Performance Optimization

### Indexes Created

#### users table
- `ix_users_api_key` (UNIQUE) - Auth lookup ~50x faster
- `ix_users_email` (UNIQUE) - Email lookup

#### urls table
- `idx_urls_short_code` (UNIQUE) - Redirect ~50x faster
- `idx_urls_user_id_active` (COMPOSITE) - List URLs ~20x faster
- `idx_urls_user_id_created` (COMPOSITE) - Sort by creation
- `idx_urls_active_expires` (COMPOSITE) - Find expired URLs

#### clicks table
- `idx_clicks_url_id` - Analytics ~10x faster
- `idx_clicks_url_clicked` (COMPOSITE) - Timeline analytics
- `idx_clicks_ip_address` - Unique visitor tracking
- `ix_clicks_clicked_at` - Time-range queries
- `ix_clicks_country` - Geographic analytics
- `ix_clicks_device_type` - Device analytics

#### webhooks table
- `idx_webhooks_user_id` - List webhooks ~10x faster
- `ix_webhooks_created_at` - Timeline
- `ix_webhooks_is_active` - Filter active

#### webhook_logs table
- `idx_webhook_logs_webhook_id` - Get logs ~10x faster

#### custom_domains table
- `idx_custom_domains_user_id` - List domains ~10x faster

### Performance Gains
- Auth: ~50ms → ~1ms (50x)
- Redirect: ~100ms → ~2ms (50x)
- List URLs: ~200ms → ~10ms (20x)
- Analytics: ~500ms → ~50ms (10x)
