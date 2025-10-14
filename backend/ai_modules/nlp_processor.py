"""NLP Processing Module for text analysis and embeddings"""
import numpy as np
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    print("Warning: spaCy not installed. Some NLP features will be limited.")
    SPACY_AVAILABLE = False
    spacy = None

try:
    import tensorflow as tf
    TF_AVAILABLE = True
except ImportError:
    print("Warning: TensorFlow not available or incompatible. Using alternatives.")
    TF_AVAILABLE = False
    tf = None

try:
    from transformers import AutoTokenizer, AutoModel
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("Warning: Transformers not available. Some features will be limited.")
    TRANSFORMERS_AVAILABLE = False
    AutoTokenizer = None
    AutoModel = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    print("Warning: scikit-learn not available.")
    SKLEARN_AVAILABLE = False
    TfidfVectorizer = None
    cosine_similarity = None
from typing import List, Dict, Any, Optional
from .base_model import BaseAIModel

class NLPProcessor(BaseAIModel):
    """Natural Language Processing model for text analysis"""
    
    def __init__(self):
        super().__init__("NLP_Processor")
        self.nlp = None
        self.tokenizer = None
        self.bert_model = None
        self.tfidf_vectorizer = None
        
    async def initialize(self) -> bool:
        """Initialize NLP models"""
        try:
            self.logger.info("Initializing NLP Processor...")
            
            # Initialize spaCy
            await self._initialize_spacy()
            
            # Initialize BERT
            await self._initialize_bert()
            
            # Initialize TF-IDF
            await self._initialize_tfidf()
            
            self.is_initialized = True
            self.logger.info("NLP Processor initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize NLP Processor: {e}")
            return False
    
    async def _initialize_spacy(self):
        """Initialize spaCy model"""
        if not SPACY_AVAILABLE:
            self.logger.warning("spaCy not available. NLP features will be limited.")
            self.nlp = None
            return
            
        try:
            self.nlp = spacy.load(self.config.SPACY_MODEL)
            self.logger.info("spaCy model loaded successfully")
        except OSError:
            self.logger.warning(f"spaCy model '{self.config.SPACY_MODEL}' not found. Please install: python -m spacy download {self.config.SPACY_MODEL}")
            self.nlp = None
    
    async def _initialize_bert(self):
        """Initialize BERT model"""
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(self.config.BERT_MODEL_NAME)
            self.bert_model = AutoModel.from_pretrained(self.config.BERT_MODEL_NAME)
            self.logger.info("BERT model loaded successfully")
        except Exception as e:
            self.logger.error(f"Error loading BERT model: {e}")
            self.tokenizer = None
            self.bert_model = None
    
    async def _initialize_tfidf(self):
        """Initialize TF-IDF vectorizer"""
        self.tfidf_vectorizer = TfidfVectorizer(**self.config.TFIDF_CONFIG)
        self.logger.info("TF-IDF vectorizer initialized")
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate input text data"""
        if not isinstance(input_data, (str, list)):
            return False
        if isinstance(input_data, str) and len(input_data.strip()) == 0:
            return False
        if isinstance(input_data, list) and not all(isinstance(item, str) for item in input_data):
            return False
        return True
    
    async def process(self, input_data: str) -> Dict[str, Any]:
        """Process text and return comprehensive analysis"""
        if not self.validate_input(input_data):
            return {"error": "Invalid input data"}
        
        try:
            result = {}
            
            # Get embeddings
            result["embeddings"] = await self.get_text_embeddings(input_data)
            
            # Extract entities
            result["entities"] = await self.extract_entities(input_data)
            
            # Get text statistics
            result["statistics"] = await self.get_text_statistics(input_data)
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing text: {e}")
            return {"error": str(e)}
    
    async def get_text_embeddings(self, text: str) -> Optional[List[float]]:
        """Generate BERT embeddings for text"""
        try:
            if not self.bert_model or not self.tokenizer:
                self.logger.warning("BERT model not available, returning zero embeddings")
                return [0.0] * 384  # Default embedding size
                
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            
            with tf.no_grad():
                outputs = self.bert_model(**inputs)
                embeddings = outputs.last_hidden_state.mean(dim=1)
            
            return embeddings.numpy().flatten().tolist()
            
        except Exception as e:
            self.logger.error(f"Error getting embeddings: {e}")
            return [0.0] * 384
    
    async def extract_entities(self, text: str) -> List[Dict[str, str]]:
        """Extract named entities from text"""
        try:
            if not self.nlp:
                return []
                
            doc = self.nlp(text)
            entities = [
                {
                    "text": ent.text,
                    "label": ent.label_,
                    "description": spacy.explain(ent.label_) if SPACY_AVAILABLE and spacy else ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char
                }
                for ent in doc.ents
            ]
            
            return entities
            
        except Exception as e:
            self.logger.error(f"Error extracting entities: {e}")
            return []
    
    async def get_text_statistics(self, text: str) -> Dict[str, Any]:
        """Get basic text statistics"""
        try:
            if not self.nlp:
                # Basic statistics without spaCy
                words = text.split()
                return {
                    "word_count": len(words),
                    "character_count": len(text),
                    "sentence_count": text.count('.') + text.count('!') + text.count('?'),
                    "average_word_length": sum(len(word) for word in words) / len(words) if words else 0
                }
            
            doc = self.nlp(text)
            
            return {
                "word_count": len([token for token in doc if not token.is_space]),
                "character_count": len(text),
                "sentence_count": len(list(doc.sents)),
                "token_count": len(doc),
                "average_word_length": np.mean([len(token.text) for token in doc if not token.is_space and not token.is_punct]),
                "pos_distribution": self._get_pos_distribution(doc),
                "readability_score": self._calculate_readability(doc)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting text statistics: {e}")
            return {}
    
    def _get_pos_distribution(self, doc) -> Dict[str, int]:
        """Get part-of-speech distribution"""
        pos_counts = {}
        for token in doc:
            if not token.is_space and not token.is_punct:
                pos_counts[token.pos_] = pos_counts.get(token.pos_, 0) + 1
        return pos_counts
    
    def _calculate_readability(self, doc) -> float:
        """Calculate simple readability score"""
        sentences = list(doc.sents)
        if not sentences:
            return 0.0
        
        total_words = len([token for token in doc if not token.is_space and not token.is_punct])
        total_sentences = len(sentences)
        
        # Simple readability score (lower is easier to read)
        avg_sentence_length = total_words / total_sentences if total_sentences > 0 else 0
        return min(10.0, avg_sentence_length / 10)  # Normalized to 0-10 scale
    
    async def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        try:
            embeddings1 = await self.get_text_embeddings(text1)
            embeddings2 = await self.get_text_embeddings(text2)
            
            if not embeddings1 or not embeddings2:
                return 0.0
            
            # Convert to numpy arrays and reshape
            emb1 = np.array(embeddings1).reshape(1, -1)
            emb2 = np.array(embeddings2).reshape(1, -1)
            
            # Calculate cosine similarity
            similarity = cosine_similarity(emb1, emb2)[0][0]
            return float(similarity)
            
        except Exception as e:
            self.logger.error(f"Error calculating similarity: {e}")
            return 0.0
    
    async def batch_process_texts(self, texts: List[str]) -> List[Dict[str, Any]]:
        """Process multiple texts in batch"""
        if not self.validate_input(texts):
            return [{"error": "Invalid input data"}]
        
        results = []
        for text in texts:
            result = await self.process(text)
            results.append(result)
        
        return results