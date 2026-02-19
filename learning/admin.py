from django.contrib import admin
from .models import Word, Sentence, Grammar, StudyLog, StudyGoal


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ['word', 'meaning', 'part_of_speech', 'difficulty', 'is_favorite', 'review_count', 'created_at']
    list_filter = ['difficulty', 'is_favorite', 'part_of_speech', 'created_at']
    search_fields = ['word', 'meaning', 'example_sentence']
    readonly_fields = ['review_count', 'last_reviewed', 'created_at', 'updated_at']
    fieldsets = (
        ('基本信息', {
            'fields': ('word', 'phonetic', 'meaning', 'part_of_speech')
        }),
        ('例句', {
            'fields': ('example_sentence', 'example_translation')
        }),
        ('分类与难度', {
            'fields': ('difficulty', 'category')
        }),
        ('学习记录', {
            'fields': ('is_favorite', 'review_count', 'last_reviewed')
        }),
        ('备注', {
            'fields': ('notes',)
        }),
        ('时间信息', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Sentence)
class SentenceAdmin(admin.ModelAdmin):
    list_display = ['english_short', 'chinese_short', 'sentence_type', 'is_favorite', 'review_count', 'created_at']
    list_filter = ['sentence_type', 'is_favorite', 'created_at']
    search_fields = ['english', 'chinese', 'keywords']
    readonly_fields = ['review_count', 'last_reviewed', 'created_at', 'updated_at']
    
    def english_short(self, obj):
        return obj.english[:50] + '...' if len(obj.english) > 50 else obj.english
    english_short.short_description = '英文'
    
    def chinese_short(self, obj):
        return obj.chinese[:50] + '...' if len(obj.chinese) > 50 else obj.chinese
    chinese_short.short_description = '中文'


@admin.register(Grammar)
class GrammarAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'category', 'is_mastered', 'review_count', 'created_at']
    list_filter = ['difficulty', 'is_mastered', 'category', 'created_at']
    search_fields = ['title', 'structure', 'explanation']
    readonly_fields = ['review_count', 'last_reviewed', 'created_at', 'updated_at']


@admin.register(StudyLog)
class StudyLogAdmin(admin.ModelAdmin):
    list_display = ['log_type', 'action', 'reference_id', 'created_at']
    list_filter = ['log_type', 'created_at']
    search_fields = ['action', 'notes']
    readonly_fields = ['created_at']


@admin.register(StudyGoal)
class StudyGoalAdmin(admin.ModelAdmin):
    list_display = ['title', 'target_words', 'target_sentences', 'target_grammar', 'is_active', 'start_date', 'end_date']
    list_filter = ['is_active', 'start_date', 'end_date']
    search_fields = ['title', 'description']
