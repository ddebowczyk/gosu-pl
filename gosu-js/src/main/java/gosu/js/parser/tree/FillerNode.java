package gosu.js.parser.tree;

import gosu.js.parser.TokenType;
import gosu.js.parser.Tokenizer;

import java.util.LinkedList;

/*(Hopefully) Temporary Node to hold tokens that we don't parse and blindly concatenate*/
public class FillerNode extends Node
{

  /*Either consists of a list of tokens or just a string of concatenated tokens*/
  private LinkedList<Tokenizer.Token> _tokens;
  private String _content;
  boolean _inOverrideFunction;

  public FillerNode()
  {
    super( null );
    _tokens = new LinkedList<>();
  }

  public FillerNode(boolean inOverrideFunction)
  {
    super( null );
    _tokens = new LinkedList<>();
    _inOverrideFunction = inOverrideFunction;
  }

  public FillerNode(String content)
  {
    super( null );
    _content = content;
  }

  public void concatToken(Tokenizer.Token token) {
    _tokens.add(token);
  }

  public Tokenizer.Token removeLastToken() {
    return _tokens.removeLast();
  }

  public Tokenizer.Token removeLastNonWhitespaceToken() {
    Tokenizer.Token toke = _tokens.removeLast();
    while (toke.getType().equals(TokenType.WHITESPACE)) {
      toke = _tokens.removeLast();
    }
    return toke;
  }

  @Override
  public String genCode()
  {
    if (_content != null) return _content;
    StringBuilder code = new StringBuilder();
    for (Tokenizer.Token token : _tokens) {
      //Replace super with Java.super(_superClassObject) to support java-style super
      if (token.getType() == TokenType.KEYWORD && token.getValue().equals("super")) {
        //needs "this._superClassObject" to reference super if not function does not override
        code.append("Java.super(" + (_inOverrideFunction?"":"this.") + ClassNode.SUPERTYPE_OBJECT + ")");
      } else {
        code.append(token.getValue());
      }
    }
    return code.toString();
  }
}
