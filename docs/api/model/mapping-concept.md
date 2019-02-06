---
description: >-
  Depending on the value type or the meta data provided from decorators, values
  are mapped to dynamoDB attributes.
---

# Mapping Concept

As long there are no decorators the mapper decides by the value type, to which dynamoDB Attribute it should be mapped.

<table>
  <thead>
    <tr>
      <th style="text-align:left">JS Type</th>
      <th style="text-align:left">Mapped DynamoDB type</th>
      <th style="text-align:left"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">boolean</td>
      <td style="text-align:left">[BOOL]</td>
      <td style="text-align:left"></td>
    </tr>
    <tr>
      <td style="text-align:left">string</td>
      <td style="text-align:left">[S]tring</td>
      <td style="text-align:left"></td>
    </tr>
    <tr>
      <td style="text-align:left">number</td>
      <td style="text-align:left">[N]umber</td>
      <td style="text-align:left"></td>
    </tr>
    <tr>
      <td style="text-align:left">Array</td>
      <td style="text-align:left">[L]ist</td>
      <td style="text-align:left"></td>
    </tr>
    <tr>
      <td style="text-align:left">
        <p>Set
          <number>
        </p>
        <p>Set
          <string>
        </p>
        <p>Set
          <Binary*>
        </p>
      </td>
      <td style="text-align:left">
        <p>[N]umber[S]et</p>
        <p>[S]tring[S]et</p>
        <p>[B]inary[S]et</p>
      </td>
      <td style="text-align:left">
        <p>Mixed item types are</p>
        <p>only supported with</p>
        <p>decorator (see below)</p>
      </td>
    </tr>
    <tr>
      <td style="text-align:left">Object</td>
      <td style="text-align:left">[M]ap</td>
      <td style="text-align:left"></td>
    </tr>
  </tbody>
</table>> \*Binary is not yet supported

{% hint style="danger" %}
Avoid using Set for types other than string\|number\|Binary without decorator.

  
`Set<CustomType>` would be mapped implicitly to \[L\]ist of \[M\]aps. But when parsing the Attribute from DynamoDB, there's no information about the Set and will therefore be parsed to an array. To fix this, use the @CollectionProperty\(\) decorator.
{% endhint %}

{% hint style="info" %}
It is not possible to store an Array to a \[S\]et even if you use the `CollectionProperty` decorator.
{% endhint %}

<table>
  <thead>
    <tr>
      <th style="text-align:left">JS Type + CollectionProperty decorator</th>
      <th style="text-align:left">DynamoDB Type</th>
      <th style="text-align:left"></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="text-align:left">
        <p><code>@CollectionProperty()</code>
        </p>
        <p><code>Set&lt;string | number&gt;</code>
        </p>
      </td>
      <td style="text-align:left">[L]ist</td>
      <td style="text-align:left">only list supports different types</td>
    </tr>
    <tr>
      <td style="text-align:left"></td>
      <td style="text-align:left"></td>
      <td style="text-align:left"></td>
    </tr>
    <tr>
      <td style="text-align:left">
        <p><code>@CollectionProperty({ sorted: true })</code>
        </p>
        <p><code>Set&lt;string&gt;</code>
        </p>
      </td>
      <td style="text-align:left">[L]ist</td>
      <td style="text-align:left">only list preserves the order</td>
    </tr>
    <tr>
      <td style="text-align:left">
        <p><code>@CollectionProperty({ sorted: true })</code>
        </p>
        <p><code>Set&lt;number&gt;</code>
        </p>
      </td>
      <td style="text-align:left">[L]ist</td>
      <td style="text-align:left">only list preserves the order</td>
    </tr>
    <tr>
      <td style="text-align:left"></td>
      <td style="text-align:left"></td>
      <td style="text-align:left"></td>
    </tr>
    <tr>
      <td style="text-align:left">
        <p><code>@CollectionProperty({ itemType: CustomType* })</code>
        </p>
        <p><code>Set&lt;CustomType&gt;</code>
        </p>
      </td>
      <td style="text-align:left">[L]ist</td>
      <td style="text-align:left">only makes sense when CustomType is @Model decorated - will be used for
        mapping</td>
    </tr>
    <tr>
      <td style="text-align:left">
        <p><code>@CollectionProperty({ itemType: CustomType* })</code>
        </p>
        <p><code>Array&lt;CustomType&gt;</code>
        </p>
      </td>
      <td style="text-align:left">[L]ist</td>
      <td style="text-align:left">only makes sense when CustomType is @Model decorated - will be used for
        mapping</td>
    </tr>
    <tr>
      <td style="text-align:left"></td>
      <td style="text-align:left"></td>
      <td style="text-align:left"></td>
    </tr>
    <tr>
      <td style="text-align:left">
        <p><code>@CollectionProperty({itemMapper:CustomTypeMapper})</code>
        </p>
        <p><code>Set&lt;CustomType&gt;</code>
        </p>
      </td>
      <td style="text-align:left">[(N|S|B)S]et</td>
      <td style="text-align:left">itemMapper must return N|S|B - Attribute</td>
    </tr>
  </tbody>
</table>> \*If CustomType is string\|number\|Binary, it will be mapped to the respective \[S\]et

Handling of empty values

